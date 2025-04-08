import React from 'react';
import Console from './Console/Console';
import '../styles/components/defaultView.scss';

const DefaultView: React.FC = () => {
  return (
    <div className="default-view">
      <Console />
    </div>
  );
};

export default DefaultView;