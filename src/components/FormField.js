const FormField = ({ label, name, error, required, children }) => (
  <div className={`form-group ${error ? 'has-error' : ''}`}>
    <label htmlFor={name}>
      {label}
      {required && <span className="required-mark"> *</span>}
    </label>
    {children}
    {error && <span className="field-error" role="alert">{error}</span>}
  </div>
);

export default FormField;
