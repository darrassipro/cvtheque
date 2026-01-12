'use client';

import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function ModalContainer() {
  return (
    <>
      <LoginModal />
      <RegisterModal />
      <ForgotPasswordModal />
    </>
  );
}
