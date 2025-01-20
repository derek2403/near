import { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function CreatePassword({ isOpen, onClose, onSubmit, error }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen) return null;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Password</h2>
        <div className="space-y-4">
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Input
            type="password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {(validationError || error) && (
            <p className="text-red-500 text-sm">{validationError || error}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Create Password
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 