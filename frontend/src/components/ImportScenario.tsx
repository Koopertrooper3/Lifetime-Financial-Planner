import React, { ChangeEvent, useState } from 'react';
import * as yaml from 'yaml';

interface YAMLImportProps {
  onFileParsed: (data: any) => void;
  allowedFileTypes?: string[];
}

const YAMLImport: React.FC<YAMLImportProps> = ({
  onFileParsed,
  allowedFileTypes = ['.yaml', '.yml'],
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!allowedFileTypes.includes(`.${fileExtension}`)) {
      setError(`Invalid file type. Please upload a YAML file (${allowedFileTypes.join(', ')})`);
      return;
    }

    try {
      const text = await file.text();
      const parsedData = yaml.parse(text);
      onFileParsed(parsedData);
    } catch (err) {
      setError('Failed to parse YAML file. Please check the file format.');
      console.error('YAML parsing error:', err);
    }

    // Reset the input to allow selecting the same file again
    event.target.value = '';
  };

  return (
    <div>
      <input
        type="file"
        accept={allowedFileTypes.join(',')}
        onChange={handleFileChange}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default YAMLImport;