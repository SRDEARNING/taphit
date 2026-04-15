//! Taphit Program — Onchain Binary Options Trading on Solana
use anchor_lang::prelude::*;

declare_id!("Taphit1111111111111111111111111111111111111");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Direction { Up, Down }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum OrderStatus { Pending, Won, Lost, Cancelled }

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Asset { Sol, Btc, Eth }

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PlaceOrderArgs {
    pub stake_amount: u64,
    pub direction: Direction,
    pub price_zone_low: u64,
    pub price_zone_high: u64,
    pub entry_price: u64,
    pub expiry_seconds: i64,
    pub multiplier_bps: u32,
    pub asset: Asset,
    pub is_demo: bool,
}

#[account]
pub struct PlatformConfig {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub usdc_mint: Pubkey,
    pub vault_bump: u8,
    pub house_edge_bps: u16,
    pub min_stake: u64,
    pub max_stake: u64,
    pub is_paused: bool,
    pub total_volume: u64,
}

#[account]
pub struct UserProfile {
    pub wallet: Pubkey,
    pub total_wagered: u64,
    pub total_won: u64,
    pub total_orders: u32,
    pub referrer: Pubkey,
    pub referral_earnings: u64,
    pub joined_at: i64,
    pub username: [u8; 20],
    pub username_len: u8,
    pub pending_orders: u32,
    pub user_bump: u8,
}

#[account]
pub struct Order {
    pub user: Pubkey,
    pub stake_amount: u64,
    pub direction: Direction,
    pub price_zone_low: u64,
    pub price_zone_high: u64,
    pub entry_price: u64,
    pub expiry_timestamp: i64,
    pub settlement_price: u64,
    pub status: OrderStatus,
    pub payout_amount: u64,
    pub multiplier_bps: u32,
    pub asset: Asset,
    pub created_at: i64,
    pub settled_at: i64,
    pub order_nonce: u32,
    pub is_demo: bool,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Platform is paused")]
    PlatformPaused,
    #[msg("Stake below minimum")]
    StakeTooLow,
    #[msg("Stake above maximum")]
    StakeTooHigh,
    #[msg("Max 3 pending orders")]
    MaxPendingOrdersReached,
    #[msg("Order not yet expired")]
    OrderNotExpired,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Grace period expired")]
    CancellationWindowExpired,
    #[msg("Demo orders must use demo instruction")]
    DemoNotAllowed,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Pending orders prevent withdrawal")]
    PendingOrdersPreventWithdrawal,
}

#[event]
pub struct UserCreated { pub user: Pubkey, pub referrer: Option<Pubkey> }

#[event]
pub struct OrderPlaced {
    pub user: Pubkey,
    pub order_id: Pubkey,
    pub stake_amount: u64,
    pub direction: Direction,
    pub asset: Asset,
    pub multiplier_bps: u32,
    pub is_demo: bool,
}

#[event]
pub struct OrderSettled {
    pub user: Pubkey,
    pub order_id: Pubkey,
    pub status: OrderStatus,
    pub settlement_price: u64,
    pub payout_amount: u64,
    pub is_demo: bool,
}

#[event]
pub struct ReferralPaid {
    pub referrer: Pubkey,
    pub referred_user: Pubkey,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut)]
    pub treasury: SystemAccount<'info>,
    /// CHECK: USDC mint
    pub usdc_mint: AccountInfo<'info>,
    #[account(
        init,
        seeds = [b"config"],
        bump,
        payer = authority,
        space = 8 + 32 + 32 + 32 + 1 + 2 + 8 + 8 + 1 + 8
    )]
    pub platform_config: Account<'info, PlatformConfig>,
    /// CHECK: Vault
    #[account(seeds = [b"vault"], bump)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUserProfile<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        init,
        seeds = [b"user", user.key().as_ref()],
        bump,
        payer = user,
        space = 8 + 32 + 8 + 8 + 4 + 32 + 8 + 8 + 20 + 1 + 4 + 1
    )]
    pub user_profile: Account<'info, UserProfile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(args: PlaceOrderArgs)]
pub struct PlaceOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"config"], bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump = user_profile.user_bump)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(
        init,
        seeds = [b"order", user.key().as_ref(), &(user_profile.total_orders + 1).to_le_bytes()],
        bump,
        payer = user,
        space = 8 + 32 + 8 + 1 + 8 + 8 + 8 + 8 + 8 + 1 + 8 + 4 + 1 + 8 + 8 + 4 + 1
    )]
    pub order: Account<'info, Order>,
    /// CHECK: User ATA
    #[account(mut)]
    pub user_usdc_ata: AccountInfo<'info>,
    /// CHECK: Vault
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    /// CHECK: Token program
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct SettleOrder<'info> {
    #[account(mut)]
    pub cranker: Signer<'info>,
    #[account(
        mut,
        constraint = order.status == OrderStatus::Pending @ ErrorCode::OrderNotExpired,
        constraint = order.user == user_profile.wallet @ ErrorCode::Unauthorized
    )]
    pub order: Account<'info, Order>,
    #[account(mut, seeds = [b"user", order.user.key().as_ref()], bump = user_profile.user_bump)]
    pub user_profile: Account<'info, UserProfile>,
    #[account(seeds = [b"config"], bump)]
    pub platform_config: Account<'info, PlatformConfig>,
    /// CHECK: Winner ATA
    #[account(mut)]
    pub winner_ata: AccountInfo<'info>,
    /// CHECK: Vault
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: AccountInfo<'info>,
    /// CHECK: Token program
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct CancelOrder<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        constraint = order.user == user.key() @ ErrorCode::Unauthorized,
        constraint = order.status == OrderStatus::Pending @ ErrorCode::OrderNotExpired,
        close = user
    )]
    pub order: Account<'info, Order>,
    #[account(mut, seeds = [b"user", user.key().as_ref()], bump = user_profile.user_bump)]
    pub user_profile: Account<'info, UserProfile>,
    /// CHECK: User ATA
    #[account(mut)]
    pub user_usdc_ata: AccountInfo<'info>,
    /// CHECK: Vault
    #[account(mut, seeds = [b"vault"], bump)]
    pub vault: AccountInfo<'info>,
    /// CHECK: Token program
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority @ ErrorCode::Unauthorized)]
    pub platform_config: Account<'info, PlatformConfig>,
}

#[program]
pub mod taphit_program {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        house_edge_bps: u16,
        min_stake: u64,
        max_stake: u64,
    ) -> Result<()> {
        let config = &mut ctx.accounts.platform_config;
        config.authority = *ctx.accounts.authority.key;
        config.treasury = *ctx.accounts.treasury.key;
        config.usdc_mint = *ctx.accounts.usdc_mint.key;
        config.vault_bump = ctx.bumps.vault;
        config.house_edge_bps = house_edge_bps;
        config.min_stake = min_stake;
        config.max_stake = max_stake;
        config.is_paused = false;
        config.total_volume = 0;
        Ok(())
    }

    pub fn create_user_profile(
        ctx: Context<CreateUserProfile>,
        referrer: Option<Pubkey>,
        username: String,
    ) -> Result<()> {
        let profile = &mut ctx.accounts.user_profile;
        let name_bytes = username.as_bytes();
        let len = name_bytes.len().min(20);
        profile.wallet = *ctx.accounts.user.key;
        profile.total_wagered = 0;
        profile.total_won = 0;
        profile.total_orders = 0;
        profile.referrer = referrer.unwrap_or(Pubkey::default());
        profile.referral_earnings = 0;
        profile.joined_at = Clock::get()?.unix_timestamp;
        profile.pending_orders = 0;
        profile.user_bump = ctx.bumps.user_profile;
        profile.username_len = len as u8;
        for i in 0..20 { profile.username[i] = if i < len { name_bytes[i] } else { 0 }; }
        emit!(UserCreated { user: *ctx.accounts.user.key, referrer });
        Ok(())
    }

    pub fn place_order(ctx: Context<PlaceOrder>, args: PlaceOrderArgs) -> Result<()> {
        let config = &ctx.accounts.platform_config;
        require!(!config.is_paused, ErrorCode::PlatformPaused);
        require!(args.stake_amount >= config.min_stake, ErrorCode::StakeTooLow);
        require!(args.stake_amount <= config.max_stake, ErrorCode::StakeTooHigh);
        require!(ctx.accounts.user_profile.pending_orders < 3, ErrorCode::MaxPendingOrdersReached);
        require!(!args.is_demo, ErrorCode::DemoNotAllowed);

        let clock = Clock::get()?;
        let order = &mut ctx.accounts.order;
        order.user = *ctx.accounts.user.key;
        order.stake_amount = args.stake_amount;
        order.direction = args.direction;
        order.price_zone_low = args.price_zone_low;
        order.price_zone_high = args.price_zone_high;
        order.entry_price = args.entry_price;
        order.expiry_timestamp = clock.unix_timestamp + args.expiry_seconds;
        order.settlement_price = 0;
        order.status = OrderStatus::Pending;
        order.payout_amount = 0;
        order.multiplier_bps = args.multiplier_bps;
        order.asset = args.asset;
        order.created_at = clock.unix_timestamp;
        order.settled_at = 0;
        order.order_nonce = ctx.accounts.user_profile.total_orders + 1;
        order.is_demo = false;

        let profile = &mut ctx.accounts.user_profile;
        profile.total_wagered += args.stake_amount;
        profile.total_orders += 1;
        profile.pending_orders += 1;
        config.total_volume += args.stake_amount;

        emit!(OrderPlaced {
            user: *ctx.accounts.user.key,
            order_id: order.key(),
            stake_amount: args.stake_amount,
            direction: args.direction,
            asset: args.asset,
            multiplier_bps: args.multiplier_bps,
            is_demo: false,
        });
        Ok(())
    }

    pub fn settle_order(
        ctx: Context<SettleOrder>,
        price: u64,
        _confidence: u64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        let order = &mut ctx.accounts.order;
        let profile = &mut ctx.accounts.user_profile;
        let config = &ctx.accounts.platform_config;

        require!(
            clock.unix_timestamp >= order.expiry_timestamp,
            ErrorCode::OrderNotExpired
        );

        if !order.is_demo {
            let user_won = match order.direction {
                Direction::Up => price >= order.price_zone_low && price <= order.price_zone_high,
                Direction::Down => price < order.price_zone_low || price > order.price_zone_high,
            };

            if user_won {
                let gross = order.stake_amount * (order.multiplier_bps as u64) / 10_000;
                let edge = gross * (config.house_edge_bps as u64) / 10_000;
                let net = gross.saturating_sub(edge);
                order.status = OrderStatus::Won;
                order.payout_amount = net;
                order.settled_at = clock.unix_timestamp;
                profile.total_won += net;

                if profile.referrer != Pubkey::default() {
                    let ref_amount = order.stake_amount / 100;
                    emit!(ReferralPaid {
                        referrer: profile.referrer,
                        referred_user: *ctx.accounts.user.key,
                        amount: ref_amount,
                    });
                }
            } else {
                order.status = OrderStatus::Lost;
                order.settled_at = clock.unix_timestamp;
            }
        }

        profile.pending_orders = profile.pending_orders.saturating_sub(1);
        order.settlement_price = price;

        emit!(OrderSettled {
            user: *ctx.accounts.user.key,
            order_id: order.key(),
            status: order.status.clone(),
            settlement_price: price,
            payout_amount: order.payout_amount,
            is_demo: order.is_demo,
        });
        Ok(())
    }

    pub fn cancel_order(ctx: Context<CancelOrder>) -> Result<()> {
        let order = &ctx.accounts.order;
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp - order.created_at <= 5,
            ErrorCode::CancellationWindowExpired
        );
        let profile = &mut ctx.accounts.user_profile;
        profile.pending_orders = profile.pending_orders.saturating_sub(1);
        Ok(())
    }

    pub fn update_config(
        ctx: Context<UpdateConfig>,
        house_edge_bps: Option<u16>,
        min_stake: Option<u64>,
        max_stake: Option<u64>,
        is_paused: Option<bool>,
        treasury: Option<Pubkey>,
    ) -> Result<()> {
        let c = &mut ctx.accounts.platform_config;
        if let Some(v) = house_edge_bps { c.house_edge_bps = v; }
        if let Some(v) = min_stake { c.min_stake = v; }
        if let Some(v) = max_stake { c.max_stake = v; }
        if let Some(v) = is_paused { c.is_paused = v; }
        if let Some(v) = treasury { c.treasury = v; }
        Ok(())
    }
}
