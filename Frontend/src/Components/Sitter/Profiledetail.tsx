// Profiledetailcard.tsx

import React from 'react';

const Profiledetailcard: React.FC = () => {
  return (
    <article className="rounded-xl border border-gray-700 bg-white p-4 mt-20" style={{ width: '90%' }}>
      <div className="flex items-center gap-4">
        <div>
          <h3 className="text-lg font-medium black">Claire Mac</h3>
        </div>
      </div>

      {/* <ul className="mt-4 space-y-2">
        <li>
          <a href="#" className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
            <strong className="font-medium text-white">Project A</strong>
            <p className="mt-1 text-xs font-medium text-gray-300">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime consequuntur deleniti, unde ab ut in!
            </p>
          </a>
        </li>
        <li>
          <a href="#" className="block h-full rounded-lg border border-gray-700 p-4 hover:border-pink-600">
            <strong className="font-medium text-white">Project B</strong>
            <p className="mt-1 text-xs font-medium text-gray-300">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sapiente cumque saepe sit.
            </p>
          </a>
        </li>
      </ul> */}
    </article>
  );
};

export default Profiledetailcard;
