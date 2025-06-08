import React from 'react';

export const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12V7.5a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 7.5v9a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16.5V12z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 12H18M16.5 10.5h.75a.75.75 0 01.75.75v1.5a.75.75 0 01-.75.75h-.75a.75.75 0 01-.75-.75v-1.5a.75.75 0 01.75-.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h7.5" />
  </svg>
);
