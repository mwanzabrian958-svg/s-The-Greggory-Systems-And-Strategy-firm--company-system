// @ts-nocheck
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { Skeleton, SkeletonCard, SkeletonTable } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { StatCard } from '../components/ui/stat-card';
import SplitScreenView from '../components/SplitScreenView';

describe('Skeleton', () => {
  afterEach(() => cleanup());

  it('renders SkeletonCard and SkeletonTable rows', () => {
    const { container, rerender } = render(<SkeletonCard />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    rerender(<SkeletonTable rows={3} />);
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(3);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('passes className through', () => {
    const { container } = render(<Skeleton className="h-5 w-5" />);
    expect(container.firstChild).toHaveClass('h-5');
  });
});

describe('Button / Badge / Card / Input', () => {
  afterEach(() => cleanup());

  it('Button renders children and variants', () => {
    const { rerender } = render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    rerender(
      <Button variant="destructive" size="sm" disabled>
        Delete
      </Button>,
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('bg-red-600');
  });

  it('Badge renders variant classes', () => {
    render(<Badge variant="success">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge.className).toContain('bg-green-100');
  });

  it('Card pieces render', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>T</CardTitle>
          <CardDescription>D</CardDescription>
        </CardHeader>
        <CardContent>C</CardContent>
        <CardFooter>F</CardFooter>
      </Card>,
    );
    for (const t of ['T', 'D', 'C', 'F']) expect(screen.getByText(t)).toBeInTheDocument();
  });

  it('Input forwards props', () => {
    render(<Input placeholder="Type here" />);
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument();
  });
});

describe('Progress', () => {
  afterEach(() => cleanup());

  it('clamps values to 0-100', () => {
    const { container, rerender } = render(<Progress value={150} />);
    expect(container.innerHTML).toContain('width: 100%');
    rerender(<Progress value={-20} />);
    expect(container.innerHTML).toContain('width: 0%');
    rerender(<Progress value={42} />);
    expect(container.innerHTML).toContain('width: 42%');
  });
});

describe('Tabs + StatCard', () => {
  afterEach(() => cleanup());

  it('switches tab content on trigger click', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList>
          <TabsTrigger value="a">Tab A</TabsTrigger>
          <TabsTrigger value="b">Tab B</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Content A</TabsContent>
        <TabsContent value="b">Content B</TabsContent>
      </Tabs>,
    );
    expect(screen.getByText('Content A')).toBeInTheDocument();
    expect(screen.queryByText('Content B')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tab B' }));
    expect(screen.getByText('Content B')).toBeInTheDocument();
    expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  });

  it('StatCard renders title, value and change', () => {
    render(<StatCard title="Revenue" value="KSH 10.00" change="+5%" />);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('KSH 10.00')).toBeInTheDocument();
    expect(screen.getByText('+5%')).toBeInTheDocument();
  });
});

describe('SplitScreenView', () => {
  afterEach(() => cleanup());

  it('renders nothing when closed', () => {
    const { container } = render(
      <SplitScreenView isOpen={false} onClose={() => {}} url="http://x" title="T" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows title/url and switches preview width', () => {
    render(<SplitScreenView isOpen onClose={() => {}} url="http://x" title="Preview me" />);
    expect(screen.getByText('Preview me')).toBeInTheDocument();
    expect(screen.getByText('http://x')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Mobile' }));
    expect(screen.getByText('375px')).toBeInTheDocument();
    expect(screen.getByText(/mobile view/)).toBeInTheDocument();
  });

  it('calls onClose from the Close button', () => {
    let closed = 0;
    render(
      <SplitScreenView
        isOpen
        onClose={() => {
          closed += 1;
        }}
        url="http://x"
        title="T"
      />,
    );
    fireEvent.click(screen.getByTitle('Close'));
    expect(closed).toBe(1);
  });
});
