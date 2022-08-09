use anchor_lang::prelude::*;

declare_id!("GaUrdNt59ULmP6jjrHao6wpgw88AARkForCrTSvkw7CL");

#[program]
pub mod gaurd {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn add_wallet(_ctx: Context<AddWallet>) -> Result<()> {
        Ok(())
    }

    pub fn in_whitelist(_ctx: Context<InWhitelist>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32)]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddWallet<'info> {
    #[account(mut, has_one = authority)]
    pub config: Account<'info, Config>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(init, seeds = [config.key().as_ref(), user.key().as_ref()], bump, payer = authority, space = 8)]
    pub wallet: Account<'info, Wallet>,
    /// CHECK: Passing in the users pubkey as a seed to create the whitelist reference
    pub user: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InWhitelist<'info> {
    pub config: Account<'info, Config>,
    #[account(mut, seeds = [config.key().as_ref(), user.key().as_ref()], bump)]
    pub wallet: Account<'info, Wallet>,
    /// CHECK: Passing in the users pubkey as a seed to create the whitelist reference
    pub user: UncheckedAccount<'info>,
}

#[account]
pub struct Config {
    pub authority: Pubkey,
}

#[account]
pub struct Wallet {}
