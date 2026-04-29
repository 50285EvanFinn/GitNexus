#!/usr/bin/env node

/**
 * GitNexus - A powerful CLI tool for GitHub repository analysis and management
 * Main entry point for the application
 */

import { Command } from 'commander';
import { exploreRepository } from './commands/explore';
import { analyzeImpact } from './commands/impact';
import { reviewPR } from './commands/review';
import { debugIssue } from './commands/debug';
import { refactorCode } from './commands/refactor';
import { logger } from './utils/logger';

const program = new Command();

program
  .name('gitnexus')
  .description('AI-powered GitHub repository analysis and management CLI')
  .version('1.0.0');

/**
 * Explore command - Analyze and explore a GitHub repository
 */
program
  .command('explore <repo>')
  .description('Explore and analyze a GitHub repository structure')
  .option('-d, --depth <number>', 'depth of directory traversal', '3')
  .option('-o, --output <format>', 'output format: json | table | tree', 'tree')
  .action(async (repo: string, options: { depth: string; output: string }) => {
    try {
      await exploreRepository(repo, {
        depth: parseInt(options.depth, 10),
        outputFormat: options.output as 'json' | 'table' | 'tree',
      });
    } catch (err) {
      logger.error('Failed to explore repository', err);
      process.exit(1);
    }
  });

/**
 * Impact command - Analyze the impact of changes in a repository
 */
program
  .command('impact <repo>')
  .description('Analyze the impact of recent changes or a specific commit')
  .option('-c, --commit <sha>', 'specific commit SHA to analyze')
  .option('-b, --branch <name>', 'branch to analyze against main', 'main')
  .action(async (repo: string, options: { commit?: string; branch: string }) => {
    try {
      await analyzeImpact(repo, {
        commitSha: options.commit,
        branch: options.branch,
      });
    } catch (err) {
      logger.error('Failed to analyze impact', err);
      process.exit(1);
    }
  });

/**
 * Review command - Perform an AI-assisted PR review
 */
program
  .command('review <repo> <pr>')
  .description('Perform an AI-assisted pull request review')
  .option('-v, --verbose', 'include detailed line-by-line analysis')
  .action(async (repo: string, pr: string, options: { verbose?: boolean }) => {
    try {
      await reviewPR(repo, parseInt(pr, 10), {
        verbose: !!options.verbose,
      });
    } catch (err) {
      logger.error('Failed to review pull request', err);
      process.exit(1);
    }
  });

/**
 * Debug command - Help debug issues in a repository
 */
program
  .command('debug <repo>')
  .description('Analyze and suggest fixes for issues in a repository')
  .option('-i, --issue <number>', 'GitHub issue number to debug')
  .option('-f, --file <path>', 'specific file to analyze')
  .action(async (repo: string, options: { issue?: string; file?: string }) => {
    try {
      await debugIssue(repo, {
        issueNumber: options.issue ? parseInt(options.issue, 10) : undefined,
        filePath: options.file,
      });
    } catch (err) {
      logger.error('Failed to debug issue', err);
      process.exit(1);
    }
  });

/**
 * Refactor command - Suggest and apply refactoring improvements
 */
program
  .command('refactor <repo>')
  .description('Suggest and optionally apply code refactoring improvements')
  .option('-f, --file <path>', 'specific file to refactor')
  .option('--dry-run', 'preview changes without applying them')
  .action(async (repo: string, options: { file?: string; dryRun?: boolean }) => {
    try {
      await refactorCode(repo, {
        filePath: options.file,
        dryRun: !!options.dryRun,
      });
    } catch (err) {
      logger.error('Failed to refactor code', err);
      process.exit(1);
    }
  });

program.parse(process.argv);
