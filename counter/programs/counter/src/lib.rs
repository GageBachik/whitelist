use anchor_lang::prelude::*;
use solana_program::pubkey;

declare_id!("CntRxF2Ln5VV98F4ABzKYXPNmNkKEmHCaW9HEBCRSDfs");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }
    pub fn add_one(ctx: Context<AddOne>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
    pub fn add_one_rso(ctx: Context<AddOneRso>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1).ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddOne<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// CHECK: Manually doing the valiadations here so its safe
    #[account(address = pubkey!("8ksqV3f3WtGvnPYGj6TQQKwFLkjuvnKpegSUbcrtPTd1"), owner = pubkey!("GaUrdNt59ULmP6jjrHao6wpgw88AARkForCrTSvkw7CL"))]
    pub whitelist_config: UncheckedAccount<'info>,
    /// CHECK: Checking the seeds here so its safe
    #[account(seeds = [whitelist_config.key().as_ref(), authority.key().as_ref()], bump, seeds::program = pubkey!("GaUrdNt59ULmP6jjrHao6wpgw88AARkForCrTSvkw7CL"), constraint = **whitelist_account.to_account_info().try_borrow_lamports().unwrap() > 0)]
    pub whitelist_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AddOneRso<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
    #[account(mut, address = pubkey!("Rso7VaZZCdHNjP783UbpyhzPY4MxDw85n6vGM4tobJ9"))]
    pub rso: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Counter {
    pub count: u64,
}

// Error Logging
#[error_code]
pub enum ErrorCode {
    Overflow,
}
