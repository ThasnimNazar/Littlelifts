import React, { useState } from 'react';
import { VStack, Button, Text, useToast } from "@chakra-ui/react";
import Header from '../../Header';
import { useNavigate } from 'react-router-dom';
import api from '../../Axiosconfig';


const MAX_IMAGES = 2;

const DocumentVerification: React.FC = () => {
  const [previewSrcs, setPreviewSrcs] = useState<(string | ArrayBuffer | null)[]>([]);
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [success, setSuccess] = useState<string | null>(null);


  const toast = useToast();
  const navigate = useNavigate();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-indigo-600');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-600');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-indigo-600');
    const files = Array.from(e.dataTransfer.files);
    if (previewSrcs.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images.`);
    } else {
      setError(null);
      files.forEach(file => displayPreview(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files!);
    if (previewSrcs.length + files.length > MAX_IMAGES) {
      setError(`You can only upload up to ${MAX_IMAGES} images.`);
    } else {
      setError(null);
      files.forEach(file => displayPreview(file));
    }
  };

  const displayPreview = (file: File) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setPreviewSrcs(prev => [...prev, reader.result]);
    };
  };

  const handleDeleteImage = (index: number) => {
    setPreviewSrcs(prev => prev.filter((_, i) => i !== index));
    setFileInputKey(prevKey => prevKey + 1); 
    setError(null); 
  };

  const handleSubmit = async () => {
    if (previewSrcs.length === 0) {
      toast({
        title: 'Info',
        description: 'Please upload at least one document.',
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    previewSrcs.forEach((src, index) => {
      const file = dataURLtoFile(src as string, `doc${index}.png`);
      formData.append('verificationDocuments', file);
    });
    const sitterInfoString = localStorage.getItem('sitterInfo');
    if (sitterInfoString) {
      const sitterInfo = JSON.parse(sitterInfoString);
      try {
        const response = await api.put(`/upload-doc/${sitterInfo._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        console.log(response,'loo')
        setSuccess("Documents uploaded successfully.");
        setPreviewSrcs([]); 
        setFileInputKey(prevKey => prevKey + 1); 
        navigate('/sitter/sitterhome')
      } catch (error) {
        setError("Failed to upload documents. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const dataURLtoFile = (dataurl: string, filename: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <>
      <Header />
      <VStack align="center" margin={10} spacing={4}>
        <div className=" flex items-center justify-center dark:bg-gray-900" style={{ width: '400px', height: '200px' }}>
          <div className="relative w-full max-w-2xl my-8 md:my-16 flex flex-col items-start space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6 px-4 py-8 border-2 border-dashed border-gray-400 dark:border-gray-400 shadow-lg rounded-lg">
            <div className="w-full sm:w-auto flex flex-col items-center sm:items-start">
              <p className="font-display text-2xl font-semibold dark:text-gray-200" itemProp="author" style={{ textDecoration: 'underline' }}>
                Document verification
              </p>
              <p className='text-sm font-medium text-red-500'>
                Trust and safety is important for littlelifts. Before completing your registration for our service, we will verify your identity to ensure safety for our little ones. Please verify by uploading your document like <span className='text-sm font-bold'>Aadhar doc or Pan card</span>.
              </p>
              <p className='text-red-500 text-sm font-semibold'>
                <span className='text-sm font-bold'>NB:</span> This is for verification process!
              </p>
            </div>
          </div>
        </div>
        <div
          className="w-[400px] relative border-2 border-dashed border-gray-400 dark:border-gray-400 shadow-lg rounded-lg p-6"
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label htmlFor="file-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              key={fileInputKey} 
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
              multiple 
            />
            <div className="text-center">
              <img className="mx-auto h-12 w-12" src="https://www.svgrepo.com/show/357902/image-upload.svg" alt="Upload Icon" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                <span>Drag and drop</span>
                <span className="text-indigo-600"> or browse</span>
                <span> to upload</span>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </label>
          {error && <Text color="red.500">{error}</Text>}
          {success && <Text color="green.500">{success}</Text>}
          {previewSrcs.length > 0 && (
            <VStack spacing={4} mt={4}>
              {previewSrcs.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src as string} className="mt-4 mx-auto max-h-40" alt="Preview" id="preview" />
                  <Button colorScheme="red" onClick={() => handleDeleteImage(index)} mt={2}>Delete Image</Button>
                </div>
              ))}
            </VStack>
          )}
          <br />
          <Button
            className='align-center'
            onClick={handleSubmit}
            isLoading={loading}
          >
            Verify
          </Button>
        </div>
      </VStack>
    </>
  );
}

export default DocumentVerification;
