export interface PlanPriceProps {
  id: string;
  planId: string;
  currency: string;
  amount: number;
  billingInterval: string;
  gatewayPriceId?: string | null;
  isActive: boolean;
}

export class PlanPriceEntity {
  readonly id: string;
  readonly planId: string;
  readonly currency: string;
  readonly amount: number;
  readonly billingInterval: string;
  readonly gatewayPriceId?: string | null;
  readonly isActive: boolean;

  constructor(props: PlanPriceProps) {
    this.id = props.id;
    this.planId = props.planId;
    this.currency = props.currency;
    this.amount = props.amount;
    this.billingInterval = props.billingInterval;
    this.gatewayPriceId = props.gatewayPriceId;
    this.isActive = props.isActive;
  }
}

export interface PlanProps {
  id: string;
  name: string;
  description?: string | null;
  maxDevices: number;
  hasAutomation: boolean;
  hasDuplicates: boolean;
  featuresDisplay: any;
  isActive: boolean;
  prices: PlanPriceEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export class PlanEntity {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly maxDevices: number;
  readonly hasAutomation: boolean;
  readonly hasDuplicates: boolean;
  readonly featuresDisplay: any;
  readonly isActive: boolean;
  readonly prices: PlanPriceEntity[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: PlanProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.maxDevices = props.maxDevices;
    this.hasAutomation = props.hasAutomation;
    this.hasDuplicates = props.hasDuplicates;
    this.featuresDisplay = props.featuresDisplay;
    this.isActive = props.isActive;
    this.prices = props.prices || [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
