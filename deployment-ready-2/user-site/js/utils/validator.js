class Validator {
  static isEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  static isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  }

  static validateForm(formElement) {
    let isValid = true;
    const errors = {};
    const inputs = formElement.querySelectorAll('[required]');

    inputs.forEach(input => {
      if (!this.isRequired(input.value)) {
        isValid = false;
        errors[input.name || input.id] = 'This field is required';
        input.style.borderColor = 'var(--error-color)';
      } else if (input.type === 'email' && !this.isEmail(input.value)) {
        isValid = false;
        errors[input.name || input.id] = 'Invalid email address';
        input.style.borderColor = 'var(--error-color)';
      } else {
        input.style.borderColor = '';
      }
    });

    return { isValid, errors };
  }
}

export default Validator;
