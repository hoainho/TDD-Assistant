
import React from 'react';
import { ImplementationPlan } from '../types';
import { Layers, Smartphone, Server, Link, Star, ChevronDown } from 'lucide-react';

interface ImplementationPlanDisplayProps {
  plans: ImplementationPlan[];
}

const Section: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
    <div className="mb-6 last:mb-0">
        <h4 className="flex items-center gap-3 text-md font-semibold text-teal-300 mb-3 border-b border-gray-700 pb-2">
            {icon}
            <span>{title}</span>
        </h4>
        <ul className="list-none space-y-3 text-sm text-gray-300">
            {items.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 flex-shrink-0"></div>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);


export const ImplementationPlanDisplay: React.FC<ImplementationPlanDisplayProps> = ({ plans }) => {
    if (!plans || plans.length === 0) {
        return <div className="text-center text-gray-500">No implementation plan available.</div>;
    }

    return (
        <div className="w-full">
            {plans.map((plan, index) => (
                <details key={index} open className="mb-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                    <summary className="p-4 font-bold text-cyan-300 text-lg cursor-pointer flex items-center justify-between transition-colors hover:bg-gray-700/50 rounded-t-lg group">
                         <div className="flex items-center gap-3">
                            <Layers size={20} />
                            <span className="uppercase tracking-wider">FEATURE: {plan.featureName}</span>
                        </div>
                        <ChevronDown className="transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="p-6 border-t border-gray-700 bg-gray-900/30 rounded-b-lg">
                        <Section 
                            title="Features to Implement"
                            icon={<Star size={18} className="text-yellow-400" />}
                            items={plan.featuresToImplement}
                        />
                         <Section 
                            title="Frontend Steps (ReactJS)"
                            icon={<Smartphone size={18} className="text-blue-400" />}
                            items={plan.frontendSteps}
                        />
                         <Section 
                            title="Backend Steps"
                            icon={<Server size={18} className="text-purple-400" />}
                            items={plan.backendSteps}
                        />
                         <Section 
                            title="Integration Steps"
                            icon={<Link size={18} className="text-green-400" />}
                            items={plan.integrationSteps}
                        />
                    </div>
                </details>
            ))}
        </div>
    );
};
