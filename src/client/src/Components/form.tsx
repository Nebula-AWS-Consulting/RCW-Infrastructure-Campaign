import React, { useState } from 'react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

const SubmissionForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear error message for the field
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    const emailRegex = /^\S+@\S+\.\S+$/;

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email is not valid.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validate()) {
      // Handle form submission (e.g., send data to an API)
      console.log('Form submitted:', formData);

      // Reset form fields
      setFormData({
        name: '',
        email: '',
        message: '',
      });

      // Optionally reset errors
      setErrors({});
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="name">Name:</label>
        <br />
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        {errors.name && (
          <div style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="email">Email:</label>
        <br />
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
        {errors.email && (
          <div style={{ color: 'red', fontSize: '0.8rem' }}>
            {errors.email}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="message">Message:</label>
        <br />
        <textarea
          id="message"
          name="message"
          rows={5}
          value={formData.message}
          onChange={handleChange}
        ></textarea>
        {errors.message && (
          <div style={{ color: 'red', fontSize: '0.8rem' }}>
            {errors.message}
          </div>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default SubmissionForm;
