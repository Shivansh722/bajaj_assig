import React, { useEffect, useState } from 'react';
import { FormResponse, FormField, FormSection } from '../types';

interface DynamicFormProps {
  rollNumber: string;
}

const DynamicForm: React.FC<DynamicFormProps> = ({ rollNumber }) => {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        console.log('Fetching form data for roll number:', rollNumber);
        const response = await fetch(
          `https://dynamic-form-generator-9rl7.onrender.com/get-form?rollNumber=${encodeURIComponent(rollNumber)}`
        );

        const data = await response.json();
        console.log('Received form data:', data);

        if (data.message === "Failed to fetch user") {
          throw new Error('Failed to fetch user data');
        }

        setFormData(data);
      } catch (err) {
        console.error('Error fetching form:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch form data');
      } finally {
        setLoading(false);
      }
    };

    if (rollNumber) {
      fetchFormData();
    }
  }, [rollNumber]);

  const validateField = (field: FormField, value: any): string => {
    if (field.required && !value) {
      return field.validation?.message || 'This field is required';
    }
    if (field.minLength && typeof value === 'string' && value.length < field.minLength) {
      return `Minimum length is ${field.minLength} characters`;
    }
    if (field.maxLength && typeof value === 'string' && value.length > field.maxLength) {
      return `Maximum length is ${field.maxLength} characters`;
    }
    return '';
  };

  const validateSection = (section: FormSection): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    section.fields.forEach(field => {
      const error = validateField(field, formValues[field.fieldId]);
      if (error) {
        newErrors[field.fieldId] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (fieldId: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [fieldId]: ''
    }));
  };

  const handleNext = () => {
    const currentSectionData = formData?.form.sections[currentSection];
    if (currentSectionData && validateSection(currentSectionData)) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentSection(prev => prev - 1);
  };

  const handleSubmit = () => {
    const currentSectionData = formData?.form.sections[currentSection];
    if (currentSectionData && validateSection(currentSectionData)) {
      console.log('Form Data:', formValues);
    }
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'tel':
      case 'email':
      case 'date':
        return (
          <input
            type={field.type}
            value={formValues[field.fieldId] || ''}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            data-testid={field.dataTestId}
          />
        );
      case 'textarea':
        return (
          <textarea
            value={formValues[field.fieldId] || ''}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            placeholder={field.placeholder}
            data-testid={field.dataTestId}
          />
        );
      case 'dropdown':
        return (
          <select
            value={formValues[field.fieldId] || ''}
            onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
            data-testid={field.dataTestId}
          >
            <option value="">Select an option</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="radio-group">
            {field.options?.map(option => (
              <label key={option.value} className="radio-label">
                <input
                  type="radio"
                  name={field.fieldId}
                  value={option.value}
                  checked={formValues[field.fieldId] === option.value}
                  onChange={(e) => handleInputChange(field.fieldId, e.target.value)}
                  data-testid={option.dataTestId}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div>Loading form...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!formData) {
    return <div>No form data available</div>;
  }

  const currentSectionData = formData.form.sections[currentSection];
  const isLastSection = currentSection === formData.form.sections.length - 1;

  return (
    <div className="dynamic-form">
      <h2>{formData.form.formTitle}</h2>
      <div className="section">
        <h3>{currentSectionData.title}</h3>
        <p>{currentSectionData.description}</p>
        {currentSectionData.fields.map(field => (
          <div key={field.fieldId} className="field">
            <label>{field.label}</label>
            {renderField(field)}
            {errors[field.fieldId] && (
              <div className="error">{errors[field.fieldId]}</div>
            )}
          </div>
        ))}
        <div className="navigation">
          {currentSection > 0 && (
            <button onClick={handlePrev}>Previous</button>
          )}
          {!isLastSection ? (
            <button onClick={handleNext}>Next</button>
          ) : (
            <button onClick={handleSubmit}>Submit</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicForm;