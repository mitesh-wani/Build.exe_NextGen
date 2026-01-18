import React, { useState } from 'react';
import './Contact.css'; // Make sure to create this CSS file

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState(''); // To show success message

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Form Submitted:', formData);
    setStatus('success');
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setStatus('');
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        
        {/* --- LEFT COLUMN: Contact Info --- */}
        <div className="contact-info">
          <div className="logo-area">
            <div className="logo-icon">✨</div>
            <h1>Contact UrbanFix</h1>
          </div>
          
          <p className="sub-text">
            Have questions about reporting a civic issue or need help navigating the dashboard? 
            We'd love to hear from you.
          </p>

          <div className="info-cards">
            {/* Email Card */}
            <div className="info-card">
              <div className="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <h3>Email Us</h3>
                <p>support@urbanfix.com</p>
              </div>
            </div>

            {/* Time Card */}
            <div className="info-card">
              <div className="icon-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div>
                <h3>Response Time</h3>
                <p>Within 24 hours</p>
              </div>
            </div>
          </div>

          <div className="why-contact">
            <h3>Why Contact Us?</h3>
            <ul>
              <li><span className="check-icon">✓</span> Technical support for the app</li>
              <li><span className="check-icon">✓</span> Partnership inquiries for Municipalities</li>
              <li><span className="check-icon">✓</span> Report a bug in the issue tracker</li>
            </ul>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Contact Form --- */}
        <div className="contact-form-wrapper">
          <div className="form-header">
            <h2>Send us a Message</h2>
            <p>We'll respond as quickly as possible</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name Input */}
            <div className="input-group">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                value={formData.name} 
                onChange={handleChange}
                required 
              />
            </div>

            {/* Email Input */}
            <div className="input-group">
              <span className="input-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </span>
              <input 
                type="email" 
                name="email" 
                placeholder="Your Email" 
                value={formData.email} 
                onChange={handleChange}
                required 
              />
            </div>

            {/* Message Input */}
            <div className="input-group">
              <span className="input-icon textarea-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </span>
              <textarea 
                name="message" 
                placeholder="Your Message" 
                rows="4" 
                value={formData.message} 
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn" disabled={status === 'success'}>
              {status === 'success' ? 'Message Sent!' : 'Send Message'}
              {status !== 'success' && (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Contact;