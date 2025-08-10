import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/src/context/AuthContext';
import { AlertProvider } from '@/src/context/AlertContext';
import '@testing-library/jest-dom';

// Import components to test
import HelpCenter from '@/src/pages/HelpCenter';
import SubmitTicket from '@/src/pages/SubmitTicket';
import MyTickets from '@/src/pages/MyTickets';
import TicketDetail from '@/src/pages/TicketDetail';
import ArticlePage from '@/src/pages/ArticlePage';
import SafetyCenter from '@/src/pages/SafetyCenter';
import LegalPage from '@/src/pages/LegalPage';

// Mock fetch
global.fetch = jest.fn();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AlertProvider>
            {children}
          </AlertProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock auth context
jest.mock('@/src/context/AuthContext', () => ({
  ...jest.requireActual('@/src/context/AuthContext'),
  useAuth: () => ({
    user: { id: 1, email: 'test@example.com', username: 'testuser' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn()
  })
}));

describe('Help Center Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Help Center search functionality', async () => {
    render(
      <TestWrapper>
        <HelpCenter />
      </TestWrapper>
    );

    // Check that help center loads
    expect(screen.getByText('Help Center')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search for help/i)).toBeInTheDocument();

    // Test search
    const searchInput = screen.getByPlaceholderText(/search for help/i);
    await userEvent.type(searchInput, 'password');

    // Wait for debounced search
    await waitFor(() => {
      expect(screen.getByText(/search results/i)).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  test('Navigate to article from search results', async () => {
    render(
      <TestWrapper>
        <HelpCenter />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search for help/i);
    await userEvent.type(searchInput, 'reset password');

    await waitFor(() => {
      const articleLink = screen.getByText(/how to reset your password/i);
      expect(articleLink).toBeInTheDocument();
    });

    // Click on article link
    const articleLink = screen.getByText(/how to reset your password/i);
    fireEvent.click(articleLink);

    // Should navigate to article page
    expect(window.location.pathname).toContain('/help/article/');
  });

  test('Browse by category', async () => {
    render(
      <TestWrapper>
        <HelpCenter />
      </TestWrapper>
    );

    // Find and click on a category
    const accountCategory = screen.getByText(/account & profile/i);
    fireEvent.click(accountCategory.closest('a')!);

    // Should navigate to category page
    expect(window.location.pathname).toContain('/help/category/account');
  });
});

describe('Support Ticket Submission Tests', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  test('Submit a new support ticket', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        ticket: {
          id: 1,
          ticket_number: 'TKT-20240115-0001',
          subject: 'Test Issue',
          status: 'open'
        }
      })
    });

    render(
      <TestWrapper>
        <SubmitTicket />
      </TestWrapper>
    );

    // Fill out the form
    const categoryButton = screen.getByText(/technical issue/i);
    fireEvent.click(categoryButton);

    const subjectInput = screen.getByLabelText(/subject/i);
    await userEvent.type(subjectInput, 'Cannot upload images');

    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.type(descriptionInput, 'When I try to upload an image, nothing happens.');

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /submit ticket/i });
    fireEvent.click(submitButton);

    // Wait for success message
    await waitFor(() => {
      expect(screen.getByText(/ticket created successfully/i)).toBeInTheDocument();
      expect(screen.getByText('TKT-20240115-0001')).toBeInTheDocument();
    });
  });

  test('Form validation', async () => {
    render(
      <TestWrapper>
        <SubmitTicket />
      </TestWrapper>
    );

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /submit ticket/i });
    fireEvent.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/please select a category/i)).toBeInTheDocument();
    });

    // Select category but leave other fields empty
    const categoryButton = screen.getByText(/payment & billing/i);
    fireEvent.click(categoryButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/subject is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });
  });

  test('Character count limits', async () => {
    render(
      <TestWrapper>
        <SubmitTicket />
      </TestWrapper>
    );

    const subjectInput = screen.getByLabelText(/subject/i);
    const longSubject = 'a'.repeat(150);
    await userEvent.type(subjectInput, longSubject);

    // Should show character count warning
    expect(screen.getByText(/100\/100/)).toBeInTheDocument();
  });
});

describe('My Tickets List Tests', () => {
  test('Display user tickets', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        tickets: [
          {
            id: 1,
            ticket_number: 'TKT-20240115-0001',
            subject: 'Cannot upload images',
            status: 'open',
            priority: 'medium',
            category: 'technical',
            created_at: '2024-01-15T10:00:00Z',
            response_count: 2
          },
          {
            id: 2,
            ticket_number: 'TKT-20240114-0001',
            subject: 'Billing question',
            status: 'resolved',
            priority: 'low',
            category: 'payment',
            created_at: '2024-01-14T10:00:00Z',
            response_count: 5,
            satisfaction_rating: 5
          }
        ],
        pagination: {
          total: 2,
          page: 1,
          totalPages: 1
        }
      })
    });

    render(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    // Wait for tickets to load
    await waitFor(() => {
      expect(screen.getByText('TKT-20240115-0001')).toBeInTheDocument();
      expect(screen.getByText('Cannot upload images')).toBeInTheDocument();
      expect(screen.getByText('TKT-20240114-0001')).toBeInTheDocument();
      expect(screen.getByText('Billing question')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Resolved')).toBeInTheDocument();

    // Check satisfaction rating
    expect(screen.getByText('★★★★★')).toBeInTheDocument();
  });

  test('Filter tickets by status', async () => {
    render(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    // Click on status filter
    const openFilter = screen.getByRole('button', { name: /open/i });
    fireEvent.click(openFilter);

    // Should trigger new fetch with status filter
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('status=open'),
        expect.any(Object)
      );
    });
  });

  test('Search tickets', async () => {
    render(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    const searchInput = screen.getByPlaceholderText(/search tickets/i);
    await userEvent.type(searchInput, 'billing');

    // Should trigger search after debounce
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('search=billing'),
        expect.any(Object)
      );
    }, { timeout: 1000 });
  });
});

describe('Ticket Detail View Tests', () => {
  const mockTicket = {
    id: 1,
    ticket_number: 'TKT-20240115-0001',
    subject: 'Cannot upload images',
    description: 'When I try to upload an image, nothing happens.',
    status: 'open',
    priority: 'medium',
    category: 'technical',
    created_at: '2024-01-15T10:00:00Z',
    user: {
      display_name: 'Test User'
    },
    responses: [
      {
        id: 1,
        message: 'Thank you for contacting support. Can you tell me what browser you are using?',
        created_at: '2024-01-15T10:30:00Z',
        user: {
          display_name: 'Support Agent',
          supportRole: 'support_agent'
        },
        is_internal_note: false
      },
      {
        id: 2,
        message: 'I am using Chrome version 120.',
        created_at: '2024-01-15T11:00:00Z',
        user: {
          display_name: 'Test User'
        },
        is_internal_note: false
      }
    ]
  };

  test('Display ticket conversation', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        ticket: mockTicket
      })
    });

    render(
      <TestWrapper>
        <TicketDetail />
      </TestWrapper>
    );

    // Wait for ticket to load
    await waitFor(() => {
      expect(screen.getByText('Cannot upload images')).toBeInTheDocument();
      expect(screen.getByText(mockTicket.description)).toBeInTheDocument();
    });

    // Check responses
    expect(screen.getByText(/thank you for contacting support/i)).toBeInTheDocument();
    expect(screen.getByText(/i am using chrome/i)).toBeInTheDocument();

    // Check support badge
    expect(screen.getByText('Support Team')).toBeInTheDocument();
  });

  test('Submit a response', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, ticket: mockTicket })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          response: {
            id: 3,
            message: 'I cleared my cache and it works now!',
            created_at: '2024-01-15T12:00:00Z',
            user: { display_name: 'Test User' },
            is_internal_note: false
          }
        })
      });

    render(
      <TestWrapper>
        <TicketDetail />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Cannot upload images')).toBeInTheDocument();
    });

    // Type response
    const responseInput = screen.getByPlaceholderText(/type your response/i);
    await userEvent.type(responseInput, 'I cleared my cache and it works now!');

    // Submit response
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for response to appear
    await waitFor(() => {
      expect(screen.getByText(/i cleared my cache/i)).toBeInTheDocument();
    });
  });

  test('Rate resolved ticket', async () => {
    const resolvedTicket = { ...mockTicket, status: 'resolved' };
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, ticket: resolvedTicket })
    });

    render(
      <TestWrapper>
        <TicketDetail />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/how was your experience/i)).toBeInTheDocument();
    });

    // Click on 5-star rating
    const fiveStarButton = screen.getAllByRole('button', { name: /star/i })[4];
    fireEvent.click(fiveStarButton);

    // Should submit rating
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/satisfaction'),
        expect.objectContaining({
          body: JSON.stringify({ rating: 5 })
        })
      );
    });
  });
});

describe('Safety Center Tests', () => {
  test('Navigate through safety center tabs', async () => {
    render(
      <TestWrapper>
        <SafetyCenter />
      </TestWrapper>
    );

    // Check default tab
    expect(screen.getByText(/safety features/i)).toBeInTheDocument();

    // Click on Tools tab
    const toolsTab = screen.getByRole('button', { name: /safety tools/i });
    fireEvent.click(toolsTab);

    // Should show safety document content
    await waitFor(() => {
      expect(screen.getByText(/staying safe online/i)).toBeInTheDocument();
    });

    // Click on Resources tab
    const resourcesTab = screen.getByRole('button', { name: /resources/i });
    fireEvent.click(resourcesTab);

    // Should show crisis resources
    await waitFor(() => {
      expect(screen.getByText(/crisis resources/i)).toBeInTheDocument();
      expect(screen.getByText('988')).toBeInTheDocument();
    });
  });

  test('Emergency resources display', async () => {
    render(
      <TestWrapper>
        <SafetyCenter />
      </TestWrapper>
    );

    // Navigate to resources
    const resourcesTab = screen.getByRole('button', { name: /resources/i });
    fireEvent.click(resourcesTab);

    // Check emergency numbers are displayed
    await waitFor(() => {
      expect(screen.getByText('988')).toBeInTheDocument();
      expect(screen.getByText(/national suicide prevention/i)).toBeInTheDocument();
      expect(screen.getByText('Text HOME to 741741')).toBeInTheDocument();
      expect(screen.getByText('1-800-656-4673')).toBeInTheDocument();
    });
  });
});

describe('Legal Pages Tests', () => {
  test('Dynamic legal page rendering', async () => {
    // Mock useParams to return 'terms'
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useParams: () => ({ slug: 'terms' })
    }));

    render(
      <TestWrapper>
        <LegalPage />
      </TestWrapper>
    );

    // Should display terms of service
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    expect(screen.getByText(/acceptance of terms/i)).toBeInTheDocument();
  });

  test('Legal page navigation', async () => {
    render(
      <TestWrapper>
        <LegalPage />
      </TestWrapper>
    );

    // Find table of contents
    const tocSection = screen.getByText(/use license/i);
    fireEvent.click(tocSection);

    // Should scroll to section (mock implementation would be needed)
    expect(tocSection).toHaveClass('text-seductive');
  });
});

describe('End-to-End Support Flow', () => {
  test('Complete support ticket lifecycle', async () => {
    // Step 1: Submit a ticket
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        ticket: {
          id: 1,
          ticket_number: 'TKT-20240115-0001',
          subject: 'E2E Test Issue',
          status: 'open'
        }
      })
    });

    const { rerender } = render(
      <TestWrapper>
        <SubmitTicket />
      </TestWrapper>
    );

    // Fill and submit ticket
    const categoryButton = screen.getByText(/technical issue/i);
    fireEvent.click(categoryButton);

    const subjectInput = screen.getByLabelText(/subject/i);
    await userEvent.type(subjectInput, 'E2E Test Issue');

    const descriptionInput = screen.getByLabelText(/description/i);
    await userEvent.type(descriptionInput, 'This is an end-to-end test.');

    const submitButton = screen.getByRole('button', { name: /submit ticket/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('TKT-20240115-0001')).toBeInTheDocument();
    });

    // Step 2: View in My Tickets
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        tickets: [{
          id: 1,
          ticket_number: 'TKT-20240115-0001',
          subject: 'E2E Test Issue',
          status: 'open',
          priority: 'medium',
          category: 'technical',
          created_at: new Date().toISOString(),
          response_count: 0
        }],
        pagination: { total: 1, page: 1, totalPages: 1 }
      })
    });

    rerender(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('E2E Test Issue')).toBeInTheDocument();
    });

    // Step 3: View ticket details
    const ticketLink = screen.getByText('TKT-20240115-0001');
    fireEvent.click(ticketLink);

    // Would continue with response flow...
  });
});

describe('Error Handling Tests', () => {
  test('Handle API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading tickets/i)).toBeInTheDocument();
    });
  });

  test('Handle 401 unauthorized', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' })
    });

    render(
      <TestWrapper>
        <MyTickets />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/please log in/i)).toBeInTheDocument();
    });
  });
});