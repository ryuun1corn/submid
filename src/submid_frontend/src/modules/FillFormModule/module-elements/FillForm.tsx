import React, { useState } from 'react';
import { FillFormPropsInterface, FormSchemaInterface } from '../interface';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuthContext } from '@/components/contexts/UseAuthContext';
import { submid_backend } from '@backend';

const FillForm: React.FC<FillFormPropsInterface> = ({
  questions,
  formData,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { profile } = useAuthContext();

  const createFormSchema = () => {
    let formSchema: FormSchemaInterface = {};

    questions.forEach((question) => {
      switch (question.typeOfQuestion) {
        case '1':
          formSchema = {
            ...formSchema,
            [question.id]: question.needAnswer
              ? z.string().min(1).max(200)
              : z.string().max(200).optional(),
          };
          break;

        case '2':
          const VALUES: [string, ...string[]] = [
            question.choices[0].id,
            // And then merge in the remaining values from `properties`
            ...question.choices.slice(1).map((p) => p.id),
          ];
          formSchema = {
            ...formSchema,
            [question.id]: question.needAnswer
              ? z.enum(VALUES)
              : z.enum(VALUES).optional(),
          };
          break;

        case '3':
          formSchema = {
            ...formSchema,
            [question.id]: question.needAnswer
              ? z
                  .array(z.string())
                  .refine((value) => value.some((item) => item), {
                    message: 'You have to select at least one item.',
                  })
              : z.array(z.string()),
          };
      }
    });

    console.log(formSchema);

    return z.object(formSchema);
  };

  const createDefaultValues = () => {
    let defaultValues = {};

    questions.forEach((question) => {
      switch (question.typeOfQuestion) {
        case '1':
          defaultValues = {
            ...defaultValues,
            [question.id]: '',
          };
          break;

        case '2':
          defaultValues = {
            ...defaultValues,
            [question.id]: undefined,
          };
          break;

        case '3':
          defaultValues = {
            ...defaultValues,
            [question.id]: [],
          };
      }
    });
    return defaultValues;
  };

  const formSchema = createFormSchema();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!profile) return;

    let formId = formData.id;
    let title = formData.title;
    const response: string[][] = questions.map((question) => {
      let answer: string;
      switch (question.typeOfQuestion) {
        case '1':
          answer = values[question.id] ?? '';
          return [answer];

        case '2':
          const id = values[question.id];
          answer =
            question.choices.find((choice) => choice.id === id)?.content ?? '';
          return [answer];

        case '3':
          const ids: string[] = values[question.id];
          const answers = question.choices
            .filter((choice) => ids.includes(choice.id))
            .map((answer) => answer.content);
          return answers;
      }
      return ['']; // just a fall back in case something wrong happens
    });

    if (formId == undefined) formId = '';

    if (title == undefined) title = '';

    let payload = {
      userId: profile.id,
      formId: formId,
      title: title,
      listOfResponseAnswer: response,
    };

    setIsLoading(true);
    if (payload != undefined) {
      const result = await submid_backend.addFormResponse(payload);
      if ('Ok' in result) {
        alert('Succes adding the response');
      } else {
        alert('Failed adding the response');
      }
    }
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6 *:border-2 *:rounded-xl *:p-5"
      >
        {questions.map((question) => {
          switch (question.typeOfQuestion) {
            case '1':
              return (
                <FormField
                  key={question.index}
                  control={form.control}
                  name={question.id}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <FormLabel>{question.content}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );

            case '2':
              return (
                <FormField
                  key={question.index}
                  control={form.control}
                  name={question.id}
                  render={({ field }) => {
                    return (
                      <FormItem className="space-y-3">
                        <FormLabel>{question.content}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {question.choices.map((choice) => {
                              return (
                                <FormItem
                                  className="flex items-center space-x-3 space-y-0"
                                  key={choice.index}
                                >
                                  <FormControl>
                                    <RadioGroupItem value={choice.id} />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {choice.content}
                                  </FormLabel>
                                </FormItem>
                              );
                            })}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              );

            case '3':
              return (
                <FormField
                  key={question.index}
                  control={form.control}
                  name={question.id}
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">
                          {question.content}
                        </FormLabel>
                      </div>
                      {question.choices.map((choice) => (
                        <FormField
                          key={choice.index}
                          control={form.control}
                          name={question.id}
                          render={({ field }) => {
                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    value={field.value}
                                    checked={field.value?.includes(choice.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            choice.id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: any) =>
                                                value !== choice.id,
                                            ),
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {choice.content}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
          }
        })}
        <Button type="submit" disabled={isLoading}>
          Submit!
        </Button>
      </form>
    </Form>
  );
};

export default FillForm;
