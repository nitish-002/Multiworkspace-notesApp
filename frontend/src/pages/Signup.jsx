import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        password2: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.post('/api/auth/register/', formData);
            // On successful registration, redirect to login
            navigate('/login');
        } catch (err) {
            console.error('Signup error:', err);
            // Handle different types of errors (e.g., username taken, email taken)
            if (err.response?.data) {
                const errorData = err.response.data;
                // If it's a simple message
                if (errorData.message) {
                    setError(errorData.message);
                } else {
                    // If it's field-specific errors, just show the first one for now or a generic message
                    const firstError = Object.values(errorData).flat()[0];
                    setError(firstError || 'Registration failed. Please check your details.');
                }
            } else {
                setError('Something went wrong. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F7F5] px-4 py-12">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Start organizing your work with us
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <Input
                            label="Username"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="johndoe"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="First Name"
                                type="text"
                                name="first_name"
                                value={formData.first_name}
                                onChange={handleChange}
                                required
                                placeholder="John"
                            />
                            <Input
                                label="Last Name"
                                type="text"
                                name="last_name"
                                value={formData.last_name}
                                onChange={handleChange}
                                required
                                placeholder="Doe"
                            />
                        </div>
                        <Input
                            label="Email address"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        isLoading={isLoading}
                    >
                        Create account
                    </Button>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="font-medium text-black hover:underline">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;
