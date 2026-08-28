/**
 * AI research provider abstraction.
 * Add new data/search providers without rewriting the app.
 *
 * Flow: query → retrieve → extract → attribute sources → admin approval → DB
 */

export type Confidence = 'high' | 'medium' | 'low' | 'unverified';

export interface ResearchField {
  field_key: string;
  value: unknown;
  source_url?: string;
  source_name?: string;
  confidence: Confidence;
  notes?: string;
}

export interface ResearchResult {
  query: string;
  fields: ResearchField[];
  raw_notes?: string;
}

export interface ResearchProvider {
  id: string;
  name: string;
  research(productName: string): Promise<ResearchResult>;
}

/** Stub provider — replace with authorized APIs only */
export class StubResearchProvider implements ResearchProvider {
  id = 'stub';
  name = 'Stub (no external calls)';

  async research(productName: string): Promise<ResearchResult> {
    return {
      query: productName,
      fields: [
        {
          field_key: 'identity.name',
          value: productName,
          confidence: 'unverified',
          notes: 'Stub only — connect an approved provider before production use.',
        },
      ],
      raw_notes: 'No external retrieval performed.',
    };
  }
}

let activeProvider: ResearchProvider = new StubResearchProvider();

export function setResearchProvider(provider: ResearchProvider) {
  activeProvider = provider;
}

export function getResearchProvider() {
  return activeProvider;
}
