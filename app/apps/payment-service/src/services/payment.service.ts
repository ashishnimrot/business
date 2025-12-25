import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { TransactionRepository } from '../repositories/transaction.repository';
import { CreatePaymentDto } from '@business-app/shared/dto';
import { Transaction } from '../entities/transaction.entity';

/**
 * Payment Service
 * 
 * Business logic layer for Payment management.
 */
@Injectable()
export class PaymentService {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {}

  /**
   * Record a payment
   */
  async recordPayment(
    businessId: string,
    userId: string,
    createDto: CreatePaymentDto
  ): Promise<Transaction> {
    // Validate amount
    if (createDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Create transaction
    const transactionData = {
      business_id: businessId,
      party_id: createDto.party_id,
      invoice_id: createDto.invoice_id,
      transaction_type: createDto.transaction_type,
      transaction_date: new Date(createDto.transaction_date),
      amount: createDto.amount,
      payment_mode: createDto.payment_mode,
      reference_number: createDto.reference_number,
      bank_name: createDto.bank_name,
      cheque_number: createDto.cheque_number,
      cheque_date: createDto.cheque_date
        ? new Date(createDto.cheque_date)
        : undefined,
      notes: createDto.notes,
      status: 'active',
      created_by: userId,
    };

    const transaction = await this.transactionRepository.create(transactionData);

    // TODO: Update invoice payment_status if invoice_id is provided
    // This will require integration with Invoice Service

    return transaction;
  }

  /**
   * Get payment by ID
   */
  async findById(businessId: string, id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id);

    if (!transaction) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    if (transaction.business_id !== businessId) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return transaction;
  }

  /**
   * Get all payments for business
   */
  async findByBusinessId(
    businessId: string,
    filters?: {
      partyId?: string;
      invoiceId?: string;
      transactionType?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    transactions: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    // Handle "new" as invoiceId (frontend sends this when creating new invoice)
    // Filter it out so we don't try to query with invalid UUID
    const processedFilters = {
      ...filters,
      invoiceId: filters?.invoiceId === 'new' ? undefined : filters?.invoiceId,
      startDate: filters?.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters?.endDate ? new Date(filters.endDate) : undefined,
      page,
      limit,
    };

    const result = await this.transactionRepository.findByBusinessId(
      businessId,
      processedFilters
    );

    return {
      transactions: result.transactions,
      total: result.total,
      page,
      limit,
    };
  }

  /**
   * Get payments for invoice
   */
  async findByInvoiceId(invoiceId: string): Promise<Transaction[]> {
    return this.transactionRepository.findByInvoiceId(invoiceId);
  }
}

