import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as Checkbox from "@radix-ui/react-checkbox";
import { CheckIcon } from "@radix-ui/react-icons";
import { authService } from "@/services/authService";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await authService.login({ email, password });
        if (response.success) {
          navigate('/home', { replace: true });
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.response?.data?.message || "An error occurred during login",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black dark:bg-black bg-white py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="w-full space-y-8 p-8 bg-white dark:bg-black border border-gray-400 dark:border-gray-600 backdrop-blur-lg rounded-2xl shadow-2xl">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-black dark:text-white text-center">Welcome Back</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4"> 
              <div className="space-y-2 ">
                <Label htmlFor="email" className="text-black dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`${errors.email ? "border-red-500" : "border-gray-400 dark:border-gray-600"} bg-transparent text-black dark:text-white`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-black dark:text-white">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${errors.password ? "border-red-500" : "border-gray-400 dark:border-gray-600"} bg-transparent text-black dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox.Root
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="h-4 w-4 rounded bg-gray-100 dark:bg-[#1c1c1c] border-gray-400 dark:border-gray-600 data-[state=checked]:bg-blue-500 dark:data-[state=checked]:bg-blue-600"
                >
                  <Checkbox.Indicator>
                    <CheckIcon className="h-4 w-4 text-white dark:border-white border-black
                     " />
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <Label htmlFor="remember-me" className="text-gray-700 dark:text-gray-400">Remember me</Label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex justify-center w-18">
              <Button type="submit" size="lg" variant="outline" className="border-gray-300 dark:border-gray-700 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign in
              </Button>
            </div>
           
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Don't have an account? {'  '}
              <Link to="/signup" className="text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:font-bold">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;