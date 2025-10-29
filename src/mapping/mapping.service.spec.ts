import { MappingService } from './mapping.service';

describe('MappingService', () => {
  const svc = new MappingService();

  it('merges client values into form schema', () => {
    const formSchema = {
      field1: {
        question: 'Question 1?',
        type: 'varchar',
        field_subtype: 'STRING',
        is_required: 1,
      },
      field2: {
        question: 'Question 2?',
        type: 'selectable',
        field_subtype: 'VARCHAR',
        is_required: 0,
      },
    };

    const clientValues = {
      field1: 'Value 1',
      field2: 'Value 2',
    };

    const result = svc.mergeValues(formSchema, clientValues);

    expect(result).toEqual({
      field1: {
        question: 'Question 1?',
        type: 'varchar',
        field_subtype: 'STRING',
        is_required: 1,
        value: 'Value 1',
      },
      field2: {
        question: 'Question 2?',
        type: 'selectable',
        field_subtype: 'VARCHAR',
        is_required: 0,
        value: 'Value 2',
      },
    });
  });

  it('uses empty string for missing client values', () => {
    const formSchema = {
      field1: { question: 'Q1', type: 'varchar', is_required: 1 },
    };

    const result = svc.mergeValues(formSchema, {});

    expect(result.field1.value).toBe('');
  });
});
