import React, { useState } from 'react';
import axios from 'axios';

const Donate = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [disableBtn, setDisableBtn] = useState(false);

  const handleCheckout = async (e) => {
    e.preventDefault(); // Prevent default form submission

    try {
      setDisableBtn(true);

      // Make a POST request to backend for checkout
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/v1/checkout`,
        { name, email, message, amount },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );

      // Initialize Razorpay options
      const options = {
        key: 'rzp_test_0hJgyaGV33UIoz', // Use the environment variable
        amount: data.order.amount, // Amount is in paisa
        currency: 'INR',
        name: 'Your Organization',
        description: 'Donation',
        order_id: data.order.id,
        handler: async function (response) {
          try {
            // Send payment verification details to backend
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/v1/payment-verification`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
            );
            alert('Payment Successful');
          } catch (error) {
            console.error('Payment Verification Error: ', error);
            alert('Payment Failed');
          }
        },
        prefill: {
          name,
          email,
        },
        notes: {
          address: 'Your address',
        },
        theme: {
          color: '#F37254',
        },
      };

      // Initialize Razorpay instance and open checkout form
      const rzp = new window.Razorpay(options);
      rzp.open();

      // Enable the button after Razorpay checkout form is opened
      setDisableBtn(false);
    } catch (error) {
      setDisableBtn(false);
      console.error('Error during checkout:', error);
    }
  };

  return (
    <section className="donate">
      <form onSubmit={handleCheckout}>
        <div>
          <img src="/logo.png" alt="logo" />
        </div>
        <div>
          <label>Show your love for Children</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter Donation Amount(INR)"
          />
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
        />
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message"
        />
        <button type="submit" className="btn" disabled={disableBtn}>
          Donate {amount ? `₹${amount}` : '₹0'}
        </button>
      </form>
    </section>
  );
};

export default Donate;
