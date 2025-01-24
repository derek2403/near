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
import { LockIcon } from '../public/icons/LockIcon';

interface CreatePasswordProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  error?: string;
}

export default function CreatePassword({ isOpen, onClose, onSubmit, error }: CreatePasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = () => {
    if (password.length < 8) {
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
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onClose}
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Create Password</ModalHeader>
            <ModalBody>
              <Input
                endContent={
                  <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                label="Enter your password"
                placeholder="Enter at least 8 characters"
                type="password"
                variant="bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
              <Input
                endContent={
                  <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                }
                label="Confirm Password"
                placeholder="Re-enter your password"
                type="password"
                variant="bordered"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
              {(error || localError) && (
                <div className="text-danger text-sm mt-2">
                  {error || localError}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="danger" 
                variant="light" 
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button 
                color="primary" 
                onPress={handleSubmit}
              >
                Secure Wallet
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
} 