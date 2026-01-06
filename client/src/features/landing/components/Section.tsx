import { ReactNode } from 'react';

export const Section = ({ children, className = "", id = "" }: { children: ReactNode; className?: string; id?: string }) => (
    <section id={id} className={`w-full py-20 px-6 md:px-12 lg:px-24 ${className}`}>
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </section>
);
