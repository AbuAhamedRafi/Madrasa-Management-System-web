import React from 'react';
import { BrandPanel } from './components/BrandPanel';
import { LoginForm } from './components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A3140] to-[#104452] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1180px] w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[640px] border border-white/10">
        <BrandPanel />
        <LoginForm />
      </div>
    </div>
  );
};

