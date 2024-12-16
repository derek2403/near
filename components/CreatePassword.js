import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
  } from "@nextui-org/react";
  import {useState} from 'react';
  
  import { LockIcon } from '../public/Icons'; // You'll need to move the icon to a separate file
  
  export default function CreatePassword({ isOpen, onClose, onSubmit, error }) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
  
    const handleSubmit = (e) => {
      e.preventDefault();
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
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
                //   endContent={
                //     <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                //   }
                  label="Password"
                  placeholder="Enter your password"
                  type="password"
                  variant="bordered"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                />
                <Input
                //   endContent={
                //     <LockIcon className="text-2xl text-default-400 pointer-events-none flex-shrink-0" />
                //   }
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  type="password"
                  variant="bordered"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
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