// @ts-nocheck
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import ErrorBoundary from '../components/ErrorBoundary';
import BrandHeader from '../components/BrandHeader';
import SiteTagline from '../components/SiteTagline';
import SocialMediaIcons from '../components/SocialMediaIcons';
import AuthLayout from '../components/AuthLayout';
import { SITE_NAME, SITE_TAGLINE } from '../constants/siteBrand';

const Boom = () => {
  throw new Error('kaboom');
};

describe('ErrorBoundary', () => {
  afterEach(() => cleanup());

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>healthy child</p>
      </ErrorBoundary>,
    );
    expect(screen.getByText('healthy child')).toBeInTheDocument();
  });

  it('shows the fallback UI with the error message on crash', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('kaboom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Recover' })).toBeInTheDocument();
  });
});

describe('BrandHeader', () => {
  afterEach(() => cleanup());

  it('renders the default site wordmark and tagline', () => {
    render(<BrandHeader />);
    expect(screen.getByText(SITE_NAME)).toBeInTheDocument();
    expect(screen.getByText(SITE_TAGLINE)).toBeInTheDocument();
  });

  it('renders custom wordmark/tagline props', () => {
    render(<BrandHeader wordmark="Custom Co" tagline="Custom tag" />);
    expect(screen.getByText('Custom Co')).toBeInTheDocument();
    expect(screen.getByText('Custom tag')).toBeInTheDocument();
  });
});

describe('SiteTagline', () => {
  afterEach(() => cleanup());

  it('renders the default tagline text', () => {
    render(<SiteTagline />);
    expect(screen.getByText('Strategic Project Development for all clients')).toBeInTheDocument();
  });

  it('renders custom text', () => {
    render(<SiteTagline text="Hello world" />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });
});

describe('SocialMediaIcons', () => {
  afterEach(() => cleanup());

  it('renders Facebook, Instagram and TikTok links', () => {
    render(<SocialMediaIcons />);
    expect(screen.getByTitle('Facebook')).toHaveAttribute(
      'href',
      expect.stringContaining('facebook.com'),
    );
    expect(screen.getByTitle('Instagram')).toHaveAttribute(
      'href',
      expect.stringContaining('instagram.com'),
    );
    expect(screen.getByTitle('TikTok')).toHaveAttribute(
      'href',
      expect.stringContaining('tiktok.com'),
    );
  });

  it('shows labels when showLabels is set', () => {
    render(<SocialMediaIcons showLabels />);
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('TikTok')).toBeInTheDocument();
  });
});

describe('AuthLayout', () => {
  afterEach(() => cleanup());

  it('renders title, subtitle and children', () => {
    render(
      <MemoryRouter>
        <AuthLayout title="Sign in" subtitle="Welcome back">
          <p>child form</p>
        </AuthLayout>
      </MemoryRouter>,
    );
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('child form')).toBeInTheDocument();
  });
});
