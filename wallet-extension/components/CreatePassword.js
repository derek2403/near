import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import { useState } from 'react';

export default function CreatePassword({ isOpen, onClose, onSubmit, error }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = () => {
    if (password.length < 1) {
      setLocalError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    onSubmit(password);
  };

  return (
    <Modal isOpen={isOpen} placement="top-center" onOpenChange={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Create Password</ModalHeader>
            <ModalBody>
              <Input
                label="Enter your password"
                type="password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                variant="bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
              {(error || localError) && (
                <p className="text-red-500 text-sm">{error || localError}</p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Cancel
              </Button>
              <Button color="primary" onPress={handleSubmit}>
                Secure Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}