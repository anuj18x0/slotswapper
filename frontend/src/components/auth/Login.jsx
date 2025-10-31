import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LogIn, Mail, Lock, RefreshCw } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <div className="card-luxury p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-navy rounded-2xl shadow-glow">
              <RefreshCw size={40} className="text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gradient-luxury mb-2">Welcome Back</h1>
          <p className="text-neutral-600">Sign in to SlotSwapper</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              <Mail size={18} className="text-royal-blue" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-2">
              <Lock size={18} className="text-royal-blue" />
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              className="input-field"
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-neutral-200">
          <p className="text-neutral-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-royal-blue hover:text-navy font-semibold hover:underline transition-colors">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;