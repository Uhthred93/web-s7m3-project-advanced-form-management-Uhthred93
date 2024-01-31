import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';

const e = {
  usernameRequired: 'Username is required',
  usernameMin: 'Username must be at least 3 characters',
  usernameMax: 'Username cannot exceed 20 characters',
  favLanguageRequired: 'Favorite language is required',
  favLanguageOptions: 'Favorite language must be either JavaScript or Rust',
  favFoodRequired: 'Favorite food is required',
  favFoodOptions: 'Favorite food must be either broccoli, spaghetti, or pizza',
  agreementRequired: 'Agreement is required',
  agreementOptions: 'Agreement must be accepted',
};

const formSchema = Yup.object().shape({
  username: Yup.string()
    .required(e.usernameRequired)
    .min(3, e.usernameMin)
    .max(20, e.usernameMax),
  favLanguage: Yup.string()
    .required(e.favLanguageRequired)
    .oneOf(['javascript', 'rust'], e.favLanguageOptions),
  favFood: Yup.string()
    .required(e.favFoodRequired)
    .oneOf(['broccoli', 'spaghetti', 'pizza'], e.favFoodOptions),
  agreement: Yup.boolean()
    .oneOf([true], e.agreementRequired)
});

export default function App() {
  const [formData, setFormData] = useState({
    username: '',
    favLanguage: '',
    favFood: '',
    agreement: false
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    favLanguage: false,
    favFood: false,
    agreement: false,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    formSchema.validate(formData, { abortEarly: false })
      .then(() => {
        setValidationErrors({});
        setIsFormValid(true);
      })
      .catch(err => {
        const errors = err.inner.reduce((acc, error) => ({
          ...acc,
          [error.path]: error.message
        }), {});
        setValidationErrors(errors);
        setIsFormValid(false);
      });
  }, [formData]);

  const onChange = evt => {
    const { name, value, type, checked } = evt.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Set the field to touched when the user changes the field
    setTouched(prevState => ({
      ...prevState,
      [name]: true,
    }));
  };

  const onBlur = evt => {
    const { name } = evt.target;
    setTouched(prevState => ({
      ...prevState,
      [name]: true,
    }));
  };

  const onSubmit = async evt => {
    evt.preventDefault();
    if (!isFormValid) return;

    try {
      const response = await fetch('https://webapis.bloomtechdev.com/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Registration successful!');
        setFormData({ username: '', favLanguage: '', favFood: '', agreement: false });
      } else {
        setErrorMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setErrorMessage('An error occurred while sending the data');
    }
  };

  return (
    <div>
      <h2>Create an Account</h2>
      <form onSubmit={onSubmit}>
        {successMessage && <h4 className="success">{successMessage}</h4>}
        {errorMessage && <h4 className="error">{errorMessage}</h4>}
  
        <div className="inputGroup">
          <label htmlFor="username">Username:</label>
          <input 
            id="username" 
            name="username" 
            type="text" 
            placeholder="Type Username" 
            onChange={onChange} 
            onBlur={onBlur} // Track when the user leaves the input
            value={formData.username} 
          />
          {touched.username && validationErrors.username && (
            <div className="validation">{validationErrors.username}</div>
          )}
        </div>
  
        <div className="inputGroup">
          <fieldset>
            <legend>Favorite Language:</legend>
            <label>
              <input 
                type="radio" 
                name="favLanguage" 
                value="javascript" 
                onChange={onChange} 
                onBlur={onBlur} // Track when the user leaves the input
                checked={formData.favLanguage === 'javascript'} 
              />
              JavaScript
            </label>
            <label>
              <input 
                type="radio" 
                name="favLanguage" 
                value="rust" 
                onChange={onChange} 
                onBlur={onBlur} // Track when the user leaves the input
                checked={formData.favLanguage === 'rust'} 
              />
              Rust
            </label>
          </fieldset>
          {touched.favLanguage && validationErrors.favLanguage && (
            <div className="validation">{validationErrors.favLanguage}</div>
          )}
        </div>
  
        <div className="inputGroup">
          <label htmlFor="favFood">Favorite Food:</label>
          <select 
            id="favFood" 
            name="favFood" 
            onChange={onChange} 
            onBlur={onBlur} // Track when the user leaves the input
            value={formData.favFood}
          >
            <option value="">-- Select Favorite Food --</option>
            <option value="pizza">Pizza</option>
            <option value="spaghetti">Spaghetti</option>
            <option value="broccoli">Broccoli</option>
          </select>
          {touched.favFood && validationErrors.favFood && (
            <div className="validation">{validationErrors.favFood}</div>
          )}
        </div>
  
        <div className="inputGroup">
          <label>
            <input 
              id="agreement" 
              type="checkbox" 
              name="agreement" 
              onChange={onChange} 
              onBlur={onBlur} // Track when the user leaves the input
              checked={formData.agreement} 
            />
            Agree to our terms
          </label>
          {touched.agreement && validationErrors.agreement && (
            <div className="validation">{validationErrors.agreement}</div>
          )}
        </div>
  
        <div>
          <input type="submit" disabled={!isFormValid} />
        </div>
      </form>
    </div>
  );
}
