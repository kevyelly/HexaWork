import React from 'react';
import { AlertCircle, Shield, CheckCircle2 } from 'lucide-react';

export const DisputesView: React.FC = () => (
  <div className="p-4 md:p-6 space-y-10">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight">Resolution Center 🛡️</h1>
        <p className="text-zinc-500 font-medium">Fair and fast mediation powered by AI and community experts.</p>
      </div>
      <div className="flex gap-3">
        <span className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl text-xs font-black border border-red-100 shadow-sm flex items-center gap-2">
          <AlertCircle size={16} /> 2 Active Cases
        </span>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-500">
          <div className="p-6 md:p-8 bg-zinc-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-black">Case #8821 - Scope Creep Dispute</h3>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">TechFlow Inc. vs John Doe</p>
            </div>
            <div className="bg-brand-500 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-500/20 animate-pulse">
              Mediation in Progress
            </div>
          </div>
          <div className="p-6 md:p-8 space-y-8">
            <div className="p-4 md:p-6 bg-zinc-50 rounded-3xl border border-zinc-100">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">The Conflict 📝</h4>
              <p className="text-zinc-700 font-medium leading-relaxed">Client requested 3 additional revisions beyond the agreed contract limit. Freelancer is requesting additional payment of $450.</p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">AI Analysis Report 🤖</h4>
              <div className="p-4 md:p-6 bg-brand-50 rounded-[2rem] border border-brand-100 flex flex-col md:flex-row gap-6">
                <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-brand-500/20">
                  <Shield size={28} />
                </div>
                <div className="flex-1">
                  <p className="text-brand-900 font-black mb-3">Based on the smart contract terms and chat history:</p>
                  <ul className="text-sm text-brand-800 space-y-3 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Contract explicitly states "Maximum 2 revisions per milestone".
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Chat logs show client requested a "complete overhaul" of the header on Oct 15th.
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                      Freelancer provided 2 revisions prior to this request.
                    </li>
                  </ul>
                  <div className="mt-8 p-5 bg-white rounded-2xl border border-brand-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 bg-brand-500 text-white rounded-bl-xl font-black text-[8px] uppercase tracking-widest">Recommendation</div>
                    <p className="text-xs font-black text-brand-900 mb-2 uppercase tracking-widest">Proposed Resolution:</p>
                    <p className="text-sm text-brand-700 font-medium leading-relaxed">Release <span className="font-black text-brand-900">80% of the disputed amount ($360)</span> to the freelancer as the request clearly falls outside original scope.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 md:p-8 border-t border-zinc-50 flex flex-col sm:flex-row gap-4">
            <button className="flex-1 bg-brand-600 text-white py-4 rounded-2xl font-black hover:bg-brand-700 transition-all shadow-xl shadow-brand-600/20 hover:scale-[1.02] active:scale-95">Accept AI Proposal ✅</button>
            <button className="flex-1 bg-white border-2 border-zinc-100 text-zinc-700 py-4 rounded-2xl font-black hover:bg-zinc-50 transition-all hover:border-zinc-200">Escalate to Human Admin 👤</button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-black text-zinc-900 mb-6">Case History 📜</h3>
          <div className="space-y-4">
            {[
              { id: '#7712', status: 'Resolved', outcome: 'Freelancer Paid', emoji: '🎉' },
              { id: '#6540', status: 'Resolved', outcome: 'Refund Issued', emoji: '↩️' },
              { id: '#5521', status: 'Dismissed', outcome: 'No Violation', emoji: '✅' },
            ].map((h, i) => (
              <div key={i} className="flex justify-between items-center p-4 border border-zinc-50 rounded-2xl hover:bg-zinc-50 transition-all cursor-pointer group">
                <div>
                  <p className="text-xs font-black text-zinc-900 group-hover:text-brand-600 transition-colors">{h.id} {h.emoji}</p>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1">{h.outcome}</p>
                </div>
                <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full">{h.status}</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 text-zinc-400 font-black text-xs uppercase tracking-widest hover:text-brand-600 transition-colors">View All History</button>
        </div>
        
        <div className="bg-brand-600 rounded-[2.5rem] p-6 md:p-8 text-white shadow-2xl shadow-brand-600/30 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          <h3 className="text-xl font-black mb-4 relative z-10">Need Help? 🆘</h3>
          <p className="text-sm text-brand-100 font-medium mb-6 relative z-10 leading-relaxed">Our support team is available 24/7 to help you resolve any issues or answer questions.</p>
          <button className="w-full py-4 bg-white text-brand-600 rounded-2xl font-black hover:bg-brand-50 transition-all relative z-10 shadow-lg">Contact Support</button>
        </div>
      </div>
    </div>
  </div>
);
