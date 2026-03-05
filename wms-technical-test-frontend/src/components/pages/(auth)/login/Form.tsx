'use client';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import Input from '@/components/commons/Input';
import PasswordInput from '@/components/commons/Input/PasswordInput';
import Button from '@/components/commons/Button';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { postAuthLogin, postAuthLoginReset } from '@/redux/slices/auth';
import { setAccessToken, setRefreshToken } from '@/utils/auth';
import { getLoginRedirectPath } from '@/helpers/authRedirect';
import { toastError, toastSuccess } from '@/helpers/reactToastify';

const baseSchema = z.object({
  email: z
    .string()
    .min(1, {
      error: 'Email is required',
    })
    .email({
      error: 'Email format should be valid.',
    }),
  password: z.string().min(1, {
    error: 'Password is required',
  }),
});

type BaseSchema = z.infer<typeof baseSchema>;

const Form = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectParam = searchParams.get('redirect');
  const postAuthLoginData = useAppSelector(
    (state) => state.auth.postAuthLoginData
  );
  const postAuthLoginErrorMessage = useAppSelector(
    (state) => state.auth.postAuthLoginErrorMessage
  );
  const postAuthLoginLoading = useAppSelector(
    (state) => state.auth.postAuthLoginLoading
  );
  const dispatch = useAppDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BaseSchema>({
    resolver: zodResolver(baseSchema),
  });

  const onSubmit = (data: BaseSchema) => {
    dispatch(postAuthLogin(data));
  };

  useEffect(() => {
    if (!postAuthLoginLoading) {
      if (postAuthLoginData) {
        const data = postAuthLoginData.data;
        let page = '/';
        const redirectTo = getLoginRedirectPath(redirectParam);

        if (redirectTo) page = redirectTo;

        toastSuccess('Success', postAuthLoginData.message, {
          onClose: () => {
            router.replace(page);
          },
        });

        if (data?.access_token) setAccessToken(data?.access_token);

        if (data?.refresh_token) setRefreshToken(data?.refresh_token);
      } else if (postAuthLoginErrorMessage) {
        toastError('Error', postAuthLoginErrorMessage);
      }

      if (postAuthLoginData || postAuthLoginErrorMessage) {
        dispatch(postAuthLoginReset());
      }
    }
  }, [
    postAuthLoginData,
    postAuthLoginErrorMessage,
    postAuthLoginLoading,
    router,
    dispatch,
    redirectParam,
  ]);

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          id='email'
          label='Email'
          type='text'
          required
          validationMessage={errors.email?.message}
          {...register('email', {})}
        />
        <PasswordInput
          id='password'
          label='Password'
          containerClassName='mt-6'
          required
          validationMessage={errors.password?.message}
          {...register('password', {})}
        />
        <Button
          type='submit'
          className='mt-8 w-full'
          color='white'
          isOutline
          isLoading={postAuthLoginLoading}
        >
          Login
        </Button>
      </form>
    </>
  );
};

export default Form;
