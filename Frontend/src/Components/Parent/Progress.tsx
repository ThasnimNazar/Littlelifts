import { Box, VStack, Text, Flex, Center } from "@chakra-ui/react";
import { useState } from "react";

interface Step {
  label: string;
  isActive: boolean;
}

interface ProgressStepSidebarProps {
  currentStep: number;
}

const steps: Step[] = [
  { label: "Category", isActive: true },
  { label: "Bbaysitters", isActive: false },
  { label: "Time", isActive: false },
  { label: "Reserve", isActive: false },
];

const ProgressStepSidebar: React.FC<ProgressStepSidebarProps> = ({ currentStep }) => {
  return (
    <Box w="250px" p="4" bg="bg.white" borderRadius="md" shadow="md" margin={20}>
      <VStack spacing="20" align="stretch" position="relative">
        {steps.map((step, index) => (
          <Flex key={index} align="center" position="relative" cursor="pointer">
            <Center
              w="30px"
              h="30px"
              borderRadius="full"
              bg={index <= currentStep ? "#ffa2b6" : "gray.300"}
              color="white"
              fontFamily='monospace'
              mr="4"
              position="relative"
              zIndex="1"
            >
              {index + 1}
            </Center>
            <Text fontFamily='monospace' fontWeight={index <= currentStep ? "bold" : "normal"}>{step.label}</Text>
            {index < steps.length - 1 && (
              <Box
                position="absolute"
                top="15px"
                left="15px"
                height="calc(100% + 60px)"
                width="2px"
                fontFamily='monospace'
                bg={index < currentStep ? "#334155" : "gray.300"}
                zIndex="0"
              />
            )}
          </Flex>
        ))}
      </VStack>
    </Box>
  );
};

export default ProgressStepSidebar;
