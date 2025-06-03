import { useState } from "react";
import Alerts from "../common/Alerts";

type SignupProps = {
  signup: (data: {
    firstName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; errors?: string[] }>;
  setCurrPage: (page: string) => void;
  login: (data: { email: string; password: string }) => Promise<{ valid: boolean; errors?: string[] }>;
};

function Signup({ signup, setCurrPage, login }: SignupProps) {
  const INITIAL_STATE = {
    firstName: "",
    email: "",
    password: "",
    confirmPwd: "",
  };

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirmPasswords()) return;
    let formattedData = formatData();
    let response = await signup(formattedData);
    if (response.success) {
      setFormData(INITIAL_STATE);
    } else {
      setErrors(response.errors ?? []);
    }
  };

  const formatData = () => {
    type FormDataKeys = keyof typeof formData;
    let formattedData: { [K in Exclude<FormDataKeys, "confirmPwd">]: string } = {
      firstName: "",
      email: "",
      password: "",
    };
    (Object.keys(formData) as FormDataKeys[]).forEach((key) => {
      if (key === "confirmPwd") return;
      if (key === "email") {
        formattedData[key] = formData[key].toLowerCase();
      } else {
        formattedData[key] = formData[key].trimEnd();
      }
    });
    return formattedData;
  };

  const confirmPasswords = () => {
    if (formData.password !== formData.confirmPwd) {
      setErrors(["Passwords do not match"]);
      return false;
    } else return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const trimCheck = name === "firstName" || name === "lastName";
    setFormData((data) => ({
      ...data,
      [name]: trimCheck ? value.trimStart().replace(/\s+/g, " ") : value.trim(),
    }));
  };

  return (
    <div className="card-body">
      <h5 className="card-title">Get started with Bably today!</h5>
      {errors.length ? <Alerts msgs={errors} /> : null}
      <form onSubmit={handleSubmit}>
        <div className="form-floating my-3">
          <input
            className="form-control"
            type="text"
            name="firstName"
            id="firstName"
            value={formData.firstName}
            placeholder="firstname"
            required
            onChange={handleChange}
          />
          <label htmlFor="firstName">First Name</label>
        </div>
        <div className="form-floating my-3">
          <input
            className="form-control"
            type="email"
            name="email"
            id="email"
            value={formData.email}
            placeholder="email"
            required
            minLength={6}
            onChange={handleChange}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div className="form-floating mb-3">
          <input
            className="form-control"
            type="password"
            name="password"
            id="password"
            value={formData.password}
            placeholder="password"
            autoComplete="current-password"
            required
            minLength={5}
            onChange={handleChange}
          />
          <label htmlFor="password">Password</label>
        </div>
        <div className="form-floating mb-3">
          <input
            className="form-control"
            type="password"
            name="confirmPwd"
            id="confirmPwd"
            value={formData.confirmPwd}
            placeholder="confirm password"
            autoComplete="confirm-password"
            required
            minLength={5}
            onChange={handleChange}
          />
          <label htmlFor="confirmPwd">Confirm Password</label>
        </div>
        <button className="btn btn-bablyBlue form-control">Next</button>
      </form>
      <p className="text-center mt-2">
        Have an account?
        <span>
          <button
            className="btn btn-link"
            onClick={() => setCurrPage("login")}
          >
            Login
          </button>
        </span>
      </p>
      <button
        className="btn btn-bablyGreen"
        onClick={() => login({ email: "demo@demo.com", password: "password" })}
      >
        Take a tour!
      </button>
    </div>
  );
}

export default Signup;
