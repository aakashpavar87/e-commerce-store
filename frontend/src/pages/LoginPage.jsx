import { motion } from "framer-motion";
import { ArrowRight, Loader, Lock, LogIn, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import FormInputElement from "../components/FormInputElement";
import { useUserStore } from "../store/useUserStore";

const LoginPage = () => {
  const {login, loading} = useUserStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    login(formData);
  };
  return (
    <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Login
        </h2>
      </motion.div>
      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInputElement
              labelName="Email"
              Icon={Mail}
              inputId="email"
              inputType="email"
              inputValue={formData.email}
              placeHolder={"johndoe@example.com"}
              onChangeHandler={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <FormInputElement
              labelName="Password"
              Icon={Lock}
              inputId="password"
              inputType="password"
              inputValue={formData.password}
              placeHolder={"******"}
              onChangeHandler={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" aria-hidden="true" />
                  Login
                </>
              )}
            </button>
          </form>
          <p className="mt-8 text-center text-sm text-gray-400">
            Not a Member ?{" "}
            <Link
              to="/signup"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Sign Up Now <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
