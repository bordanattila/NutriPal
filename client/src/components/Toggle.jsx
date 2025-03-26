import React from "react";

const Toggle = ({ checked, onChange }) => (
    <label className="relative inline-block w-12 h-6 cursor-pointer">
        {/* Hidden checkbox for accessibility */}
        <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={onChange}
        />
        {/* The track */}
        <div className="block bg-gray-300 rounded-full w-12 h-6 transition-colors duration-200" />
        {/* The knob */}
        <div
            className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform duration-200 ${checked ? "translate-x-6" : ""
                }`}
        />
    </label>
);

export default Toggle;