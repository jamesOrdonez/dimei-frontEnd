import { useState, useEffect } from 'react';
import { Grid } from '@mui/material';
import BaseText from './inputs/input-text/base.text.tsx';
import BaseSelect from './inputs/input-select/base.select.tsx';
import BasePassword from './inputs/input-password/base.password.tsx';
import BaseNumber from './inputs/input-number/base.number.tsx';
import BaseFile from './inputs/input-file/base.file.tsx';
import ItemsList from './inputs/item-row/items.list.tsx';

// Mapping of input types to their respective components
const INPUT_COMPONENTS: Record<string, any> = {
  text: BaseText,
  select: BaseSelect,
  password: BasePassword,
  number: BaseNumber,
  file: BaseFile,
  items: ItemsList
};

export interface BaseField {
  name: string;
  label: string;
  input: string;
  grid: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  required?: boolean;
  rows?: number;
  options?: { label: string; value: any }[];
  endpoint?: string;
  optionLabel?: string;
  optionValue?: string;
  selectLabel?: string;
  hasToHide?: (params: { values: any; mode: 'create' | 'update' }) => boolean;
  dynamicProps?: (params: { values: any; mode: 'create' | 'update' }) => Partial<BaseField>;
}

interface BaseFormProps {
  fields: BaseField[];
  initialValues?: Record<string, any>;
  onChange?: (data: Record<string, any>) => void;
  mode?: 'create' | 'update';
}

export default function BaseForm({ fields, initialValues, onChange, mode = 'create' }: BaseFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues || {});

  useEffect(() => {
    if (initialValues) {
      setFormData(initialValues);
    }
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files, type } = e.target;
    const newData = {
      ...formData,
      [name]: type === 'file' ? files?.[0] : value,
    };
    setFormData(newData);
    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        // Merge dynamic props if available, ensure nested objects like 'grid' are merged not replaced
        const dProps = field.dynamicProps ? field.dynamicProps({ values: formData, mode }) : {};
        const currentField = {
          ...field,
          ...dProps,
          grid: {
            ...field.grid,
            ...(dProps.grid || {}),
          },
        };

        if (currentField.hasToHide && currentField.hasToHide({ values: formData, mode })) {
          return null;
        }

        const InputComponent = INPUT_COMPONENTS[currentField.input];

        return (
          <Grid
            key={currentField.name}
            item
            xs={currentField.grid.xs || 12}
            sm={currentField.grid.sm || currentField.grid.xs || 12}
            md={currentField.grid.md || currentField.grid.sm || currentField.grid.xs || 12}
            lg={currentField.grid.lg || currentField.grid.md || currentField.grid.sm || currentField.grid.xs || 12}
            xl={currentField.grid.xl || currentField.grid.lg || currentField.grid.md || currentField.grid.sm || currentField.grid.xs || 12}
          >
            {InputComponent ? (
              <InputComponent
                {...(() => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { input, grid, hasToHide, dynamicProps, ...fieldProps } = currentField;
                  return fieldProps;
                })()}
                value={formData[currentField.name]}
                onChange={handleChange}
              />
            ) : (
              <>No existe el componente</>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
