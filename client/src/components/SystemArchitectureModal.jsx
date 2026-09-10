import React from 'react';
import { useOfficer } from '../context/OfficerContext';
import { X, CheckCircle2, Shield, Database, Cpu, Globe, Server, Code } from 'lucide-react';

export default function SystemArchitectureModal({ isOpen, onClose }) {
  const { systemStatus } = useOfficer();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #E2E8F0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0C2340', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Server size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0C2340' }}>System Architecture & Integration Layer</h2>
              <p style={{ fontSize: '0.8rem', color: '#64748B' }}>MoSPI • NSSTA • iGOT Karmayogi Bharat Architecture (SIH 2026)</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Integration Status Cards */}
          <div className="grid-2">
            <div className="card" style={{ padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0C2340', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} color="#FF9933" />
                  <span>iGOT Karmayogi Service</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  Ready for SSO/API
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                <div><strong>Portal:</strong> {systemStatus?.igot?.portalUrl || 'https://www.igotkarmayogi.gov.in'}</div>
                <div><strong>Mode:</strong> {systemStatus?.igot?.mode || 'VERIFIED_OFFICIAL_CATALOGUE'}</div>
                <div style={{ marginTop: '6px', color: '#047857', fontSize: '0.74rem' }}>
                  ✓ Official direct deep-linking enabled. Environment variables configured for department credentials.
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0C2340', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Server size={16} color="#059669" />
                  <span>NSSTA / TPAC Service</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.68rem' }}>
                  Ready for SSO/API
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                <div><strong>Academy:</strong> Greater Noida, Uttar Pradesh</div>
                <div><strong>Mode:</strong> {systemStatus?.nssta?.mode || 'VERIFIED_OFFICIAL_CATALOGUE'}</div>
                <div style={{ marginTop: '6px', color: '#047857', fontSize: '0.74rem' }}>
                  ✓ TPAC training calendar synchronized. Direct portal redirections active.
                </div>
              </div>
            </div>
          </div>

          {/* AI Modular Service Architecture */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0C2340', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#2563EB" />
              <span>Modular AI Architecture</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>1. Profile Analysis</strong><br />Role & assignment semantic matching
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>2. Competency Selection</strong><br />Filters 4 official domains
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>3. Adaptive Testing</strong><br />Dynamic 3-tier difficulty adjuster
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>4. Skill Gap Engine</strong><br />Required vs Demonstrated delta
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>5. Roadmap Generator</strong><br />Multi-factor priority ranking
              </div>
              <div style={{ background: '#F1F5F9', padding: '8px', borderRadius: '6px' }}>
                <strong>6. MCQ Evaluator</strong><br />Document extraction & Before/After
              </div>
            </div>
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#10B981" />
              <span>Active Engine: <strong>{systemStatus?.aiProvider?.activeEngine || 'Statistical AI Engine (Built-in Rule & NLP Base)'}</strong></span>
            </div>
          </div>

          {/* Database Entities Mapping */}
          <div className="card" style={{ padding: '18px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#0C2340', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={18} color="#E65100" />
              <span>Relational Entities & Data Contracts</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
              <code>Role</code> → <code>Required Competencies</code> → <code>Required Level</code><br />
              <code>Officer</code> → <code>Actual Competencies</code><br />
              <code>Actual Competency</code> vs <code>Required Competency</code> → <code>Skill Gap</code><br />
              <code>Skill Gap</code> → <code>Priority Score</code> → <code>Personalized Course Recommendation</code>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close Architecture Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
