'use client';

import React from 'react';
import InfiniteMenu from '../components/InfinitiMenu';

const items = [
  {
    image: '/images/Bogen.jpg',
    link: 'https://example.com/project1',
    title: 'Project 1',
    description: 'Description of your first project. Add details about technologies used and outcomes.'
  },
  {
    image: '/images/Briefbogen.jpg',
    link: 'https://example.com/project2',
    title: 'Project 2',
    description: 'Description of your second project. Highlight key features and achievements.'
  },
  {
    image: '/images/Insta.jpg',
    link: 'https://example.com/project3',
    title: 'Project 3',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  },
  {
    image: '/images/Postkarte-01.jpg',
    link: 'https://example.com/project3',
    title: 'Project 4',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  },
  {
    image: '/images/Postkarte-02.jpg',
    link: 'https://example.com/project3',
    title: 'Project 5',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  },
  {
    image: '/images/Visitkarte-01.jpg',
    link: 'https://example.com/project3',
    title: 'Project 6',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  },
  {
    image: '/images/Visitkarte-02.jpg',
    link: 'https://example.com/project3',
    title: 'Project 7',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  },  {
    image: '/images/iphon.jpg',
    link: 'https://example.com/project3',
    title: 'Project 8',
    description: 'Description of your third project. Mention your role and the impact of the project.'
  }
];

export default function ProjectsMenu() {
  return (
    <div style={{ height: '90%', position: 'relative' }}>
      <InfiniteMenu items={items} />
    </div>
  );
}