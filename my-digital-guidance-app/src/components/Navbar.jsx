import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="font-bold text-xl">Digital Guidance App</h1>
        <ul className="flex space-x-4">
          <li className="hover:text-gray-200 cursor-pointer">Home</li>
          <li className="hover:text-gray-200 cursor-pointer">Courses</li>
          <li className="hover:text-gray-200 cursor-pointer">Colleges</li>
          <li className="hover:text-gray-200 cursor-pointer">About</li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
