import React from "react";

const LoginSuccess: React.FC = () => {
  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Login Successful!</h2>
      <p className="mb-6">You have successfully logged in.</p>
      <a href="/" className="text-blue-600 hover:underline">Go to Home</a>
    </div>
  );
};

export default LoginSuccess;
