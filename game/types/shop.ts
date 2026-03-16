import type { ItemId } from './items';
import type { ResourceId } from './resources';
import type { MultiplierTarget } from './multipliers';

export type ShopOfferTier = 'normal' | 'premium' | 'forge';

export type ShopOfferId =
  | 'supply_mystery_pack'
  | 'supply_bronze_pickaxe'
  | 'supply_bronze_hatchet'
  | 'supply_bronze_sword'
  | 'premium_bag_tab'
  | 'forge_sigil_mining_i'
  | 'forge_sigil_mining_ii'
  | 'forge_sigil_woodcutting_i'
  | 'forge_sigil_combat_i'
  | 'forge_sigil_combat_ii'
  | 'forge_sigil_wisdom';

export type GachaPackId = 'shopkeeper_starter_pack';

export interface GachaPackDrop {
  itemId: ItemId;
  weight: number;
}

export interface GachaPackDefinition {
  id: GachaPackId;
  name: string;
  description: string;
  itemsPerPack: number;
  drops: readonly GachaPackDrop[];
}

export interface ResourceCost {
  resourceId: ResourceId;
  amount: number;
}

export type ShopPricing =
  | {
      kind: 'fixed';
      currency: 'coins';
      amount: number;
    }
  | {
      kind: 'exponential';
      currency: 'coins';
      baseAmount: number;
      multiplier: number;
      basedOn: 'bag_extra_tabs';
    }
  | {
      kind: 'resource';
      costs: readonly ResourceCost[];
    };

export type ShopOfferEffect =
  | {
      kind: 'grant_item';
      itemId: ItemId;
      quantity: number;
    }
  | {
      kind: 'bag_tab';
      tabs: number;
    }
  | {
      kind: 'open_gacha_pack';
      packId: GachaPackId;
    }
  | {
      kind: 'grant_multiplier';
      multiplierId: string;
      target: MultiplierTarget;
      value: number;
      multiplierType: 'additive' | 'multiplicative';
    };

export interface ShopOffer {
  id: ShopOfferId;
  tier: ShopOfferTier;
  name: string;
  description: string;
  icon: string;
  pricing: ShopPricing;
  effect: ShopOfferEffect;
}
