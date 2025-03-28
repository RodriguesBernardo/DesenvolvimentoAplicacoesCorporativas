// components/common/LoadingSpinner.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

export const LoadingSpinner = ({ fullPage = false }) => (
  <div className={`d-flex justify-content-center align-items-center ${fullPage ? 'vh-100' : ''}`}>
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Carregando...</span>
    </Spinner>
  </div>
);

// components/common/ErrorBoundary.js
import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container my-5">
          <Alert variant="danger">
            <Alert.Heading>Algo deu errado!</Alert.Heading>
            <p>{this.state.error.message}</p>
          </Alert>
        </div>
      );
    }
    return this.props.children;
  }
}