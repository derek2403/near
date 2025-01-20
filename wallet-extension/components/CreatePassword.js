import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function CreatePassword({ isOpen, onClose, onSubmit, error }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = () => {
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    onSubmit(password);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Create Password</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <Input
              type={showPassword ? "text" : "password"}
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endContent={
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              }
            />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              endContent={
                <button onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              }
            />
            {(validationError || error) && (
              <p className="text-danger text-sm">{validationError || error}</p>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button color="primary" onPress={handleSubmit}>
            Create Password
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 