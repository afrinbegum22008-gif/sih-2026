import React from 'react';
import { ExternalLink, Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="gov-footer">
      <div className="app-container">
        <div className="footer-inner">
          <div>
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
              Ministry of Statistics and Programme Implementation (MoSPI)
            </div>
            <div style={{ color: '#94A3B8', marginTop: '2px', fontSize: '0.8rem' }}>
              National Statistical Systems Training Academy (NSSTA) • Mission Karmayogi Bharat Integration
            </div>
          </div>

          <div className="footer-links">
            <a 
              href="https://igotkarmayogi.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>iGOT Karmayogi Portal</span>
              <ExternalLink size={12} />
            </a>

            <a 
              href="https://www.nssta.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>NSSTA Greater Noida</span>
              <ExternalLink size={12} />
            </a>

            <a 
              href="https://www.mospi.gov.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>MoSPI Official</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '20px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            © 2026 Government of India. Designed for Smart India Hackathon (SIH 2026) Official Statistical System Problem Statement.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#10B981' }}>
            <Shield size={12} />
            <span>DPDP Act 2023 & Security Standards Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
