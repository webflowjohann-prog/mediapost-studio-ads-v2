import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '' }) => (
  <div className={`card ${className}`}>
    <h3 className="section-title">{title}</h3>
    {children}
  </div>
);
