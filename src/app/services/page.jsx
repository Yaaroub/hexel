import { createElement } from 'react';
import { Code2, Palette, Smartphone, Cloud } from 'lucide-react';

const services = [
  {
    icon: createElement(Code2, { className: 'h-8 w-8' }),
    title: 'Custom Software Development',
    description: 'Full-cycle development of scalable enterprise solutions'
  },
  {
    icon: createElement(Palette, { className: 'h-8 w-8' }),
    title: 'UX/UI Design',
    description: 'User-centered interface design & experience optimization'
  },
  {
    icon: createElement(Smartphone, { className: 'h-8 w-8' }),
    title: 'Mobile Applications',
    description: 'Cross-platform mobile solutions for iOS & Android'
  },
  {
    icon: createElement(Cloud, { className: 'h-8 w-8' }),
    title: 'Cloud Solutions',
    description: 'Cloud architecture & migration services'
  }
];

export default function ServicesPreview() {
  return createElement(
    'section',
    { className: 'py-16 bg-slate-800/30' },
    createElement(
      'div',
      { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
      createElement(
        'div',
        { className: 'text-center mb-12' },
        createElement('h2', { className: 'text-3xl font-bold tracking-tight' }, 'Our Core Services'),
        createElement('p', { className: 'mt-4 text-lg text-slate-300' }, 'End-to-end digital solutions for modern businesses')
      ),
      createElement(
        'div',
        { className: 'grid md:grid-cols-2 lg:grid-cols-4 gap-8' },
        services.map((service, index) =>
          createElement(
            'div',
            { key: index, className: 'p-6 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors' },
            createElement('div', { className: 'text-emerald-400 mb-4' }, service.icon),
            createElement('h3', { className: 'text-xl font-semibold mb-2' }, service.title),
            createElement('p', { className: 'text-slate-300' }, service.description)
          )
        )
      )
    )
  );
}
