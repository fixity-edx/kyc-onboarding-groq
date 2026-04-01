import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { clearToken, getUser } from "../lib/auth";
import Button from "../components/Button";
import Input from "../components/Input";
import Select from "../components/Select";
import Stepper from "../components/Stepper";
import Toast from "../components/Toast";
import { LogOut, UploadCloud, Shield, Sparkles, CheckCircle2, XCircle } from "lucide-react";

function Modal({ open, title, children, onClose }){
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-panel glass overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-semibold">{title}</div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">✕</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export default function Dashboard(){
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const steps = [
    { key:"profile", label:"Profile" },
    { key:"documents", label:"Documents" },
    { key:"review", label:"Review" },
    { key:"decision", label:"Decision" },
  ];

  const [my, setMy] = useState(null);
  const [all, setAll] = useState([]);
  const [toast, setToast] = useState(null);
  const notify = (title, message="") => { setToast({ title, message }); setTimeout(()=>setToast(null), 3200); };

  const fetchAll = async () => {
    try{
      const [m, a] = await Promise.all([
        api.get("/kyc/me"),
        isAdmin ? api.get("/kyc") : Promise.resolve({ data: [] })
      ]);
      setMy(m.data);
      setAll(a.data);
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  useEffect(()=>{ fetchAll(); }, []);

  const logout = async () => {
    try{ await api.post("/auth/logout", {}); }catch{}
    clearToken();
    window.location.href = "/login";
  };

  const currentStepIndex = useMemo(() => {
    if(!my) return 0;
    const map = { profile:0, documents:1, review:2, decision:3 };
    return map[my.stage] ?? 0;
  }, [my]);

  // upload docs
  const [openUpload, setOpenUpload] = useState(false);
  const [docType, setDocType] = useState("Aadhaar");
  const [file, setFile] = useState(null);

  const upload = async (e) => {
    e.preventDefault();
    if(!file) return notify("Missing file","Choose a file first");
    try{
      const fd = new FormData();
      fd.append("docType", docType);
      fd.append("file", file);
      await api.post("/kyc/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      notify("Uploaded","Document uploaded successfully");
      setOpenUpload(false);
      setFile(null);
      fetchAll();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  // AI chat
  const [aiOpen, setAiOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const askAI = async () => {
    try{
      setAnswer("Thinking...");
      const res = await api.post("/ai/guide", { question });
      setAnswer(res.data.answer || "");
    }catch(err){
      setAnswer(err?.response?.data?.message || err.message);
    }
  };

  // admin actions
  const updateDecision = async (id, decision) => {
    try{
      await api.put(`/kyc/${id}/decision`, { decision });
      notify("Updated","Decision saved");
      fetchAll();
    }catch(err){
      notify("Error", err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="rounded-panel glass p-6 md:p-8">
          <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-sm text-slate-200">
                <Sparkles size={16} />
                Onboarding + KYC Platform
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 tracking-tight">
                Customer Onboarding Workflow
              </h1>
              <p className="text-slate-300 mt-2">
                Logged in as <span className="font-semibold">{user?.name}</span> ({user?.role})
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!isAdmin ? <Button onClick={()=>setOpenUpload(true)}><UploadCloud size={18}/> Upload Document</Button> : null}
              <Button variant="secondary" onClick={()=>setAiOpen(true)}><Sparkles size={18}/> Ask AI</Button>
              <Button variant="secondary" onClick={logout}><LogOut size={18}/> Logout</Button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <Stepper steps={steps} current={currentStepIndex} />

            <div className="mt-4 rounded-panel glass p-6">
              <h2 className="text-xl font-extrabold">My KYC Status</h2>
              <div className="mt-3 grid md:grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-400">Stage</div>
                  <div className="text-lg font-bold mt-1">{my?.stage || "profile"}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                  <div className="text-xs text-slate-400">Final Status</div>
                  <div className={"text-lg font-bold mt-1 "+(my?.finalStatus==="approved"?"text-emerald-200":my?.finalStatus==="rejected"?"text-rose-200":"text-amber-200")}>
                    {my?.finalStatus || "pending"}
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="font-semibold">Uploaded Documents</div>
                <div className="mt-3 grid gap-2">
                  {(my?.documents || []).length === 0 ? <div className="text-slate-400">No documents uploaded yet.</div> : null}
                  {(my?.documents || []).map((d, idx) => (
                    <div key={idx} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold">{d.docType}</div>
                        <div className="text-xs text-slate-400">Uploaded: {new Date(d.uploadedAt).toLocaleString()}</div>
                      </div>
                      <a className="text-emerald-300 hover:text-emerald-200 text-sm font-semibold" href={d.fileUrl} target="_blank">View</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-panel glass p-5">
            <div className="text-lg font-bold inline-flex items-center gap-2"><Shield size={18}/> Admin Panel</div>
            {!isAdmin ? (
              <div className="text-slate-400 mt-3 text-sm">Only admin can verify and approve/reject KYC submissions.</div>
            ) : (
              <div className="mt-4 grid gap-3">
                {all.length===0 ? <div className="text-slate-400">No submissions.</div> : null}
                {all.map(k => (
                  <div key={k._id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                    <div className="font-bold">{k.user?.name} • {k.user?.email}</div>
                    <div className="text-xs text-slate-400 mt-1">Stage: {k.stage} • Status: {k.finalStatus}</div>
                    <div className="text-xs text-slate-400 mt-1">Docs: {k.documents?.length || 0}</div>

                    {k.finalStatus==="pending" ? (
                      <div className="mt-3 flex gap-2 justify-end">
                        <button onClick={()=>updateDecision(k._id,"approved")} className="px-4 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-100 font-semibold inline-flex items-center gap-2">
                          <CheckCircle2 size={16}/> Approve
                        </button>
                        <button onClick={()=>updateDecision(k._id,"rejected")} className="px-4 py-2 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-100 font-semibold inline-flex items-center gap-2">
                          <XCircle size={16}/> Reject
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Modal open={openUpload} title="Upload KYC Document" onClose={()=>setOpenUpload(false)}>
          <form onSubmit={upload} className="grid gap-4">
            <Select label="Document Type" value={docType} onChange={(e)=>setDocType(e.target.value)}>
              <option>Aadhaar</option>
              <option>PAN</option>
              <option>Driving License</option>
              <option>Passport</option>
            </Select>
            <div>
              <div className="text-sm text-slate-300 mb-2">Choose File</div>
              <input type="file" required onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={()=>setOpenUpload(false)}>Cancel</Button>
              <Button type="submit">Upload</Button>
            </div>
          </form>
        </Modal>

        <Modal open={aiOpen} title="Ask AI - Onboarding Guidance" onClose={()=>setAiOpen(false)}>
          <div className="grid gap-3">
            <div className="text-sm text-slate-300">AI will answer based on your current onboarding stage.</div>
            <Input label="Your Question" value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="What documents do I need to upload?" />
            <Button onClick={askAI}>Ask Groq AI</Button>
            <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm whitespace-pre-wrap">
              {answer || "Ask a question to get guidance..."}
            </div>
          </div>
        </Modal>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
