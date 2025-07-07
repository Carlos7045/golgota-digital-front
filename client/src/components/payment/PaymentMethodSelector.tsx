import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreditCard, Smartphone, FileText, Clock, Zap, Building } from 'lucide-react';

interface PaymentMethodSelectorProps {
  value: number;
  eventName: string;
  onPaymentMethodSelect: (method: PaymentMethod) => void;
  onCancel: () => void;
}

interface PaymentMethod {
  type: 'PIX' | 'CREDIT_CARD' | 'BOLETO';
  installments?: number;
}

const PaymentMethodSelector = ({ value, eventName, onPaymentMethodSelect, onCancel }: PaymentMethodSelectorProps) => {
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD' | 'BOLETO'>('PIX');
  const [installments, setInstallments] = useState<number>(1);

  const paymentMethods = [
    {
      id: 'PIX',
      name: 'PIX',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Pagamento instantâneo',
      features: ['Aprovação imediata', 'Disponível 24h', 'Sem taxas extras'],
      processingTime: 'Imediato',
      color: 'bg-green-600'
    },
    {
      id: 'CREDIT_CARD',
      name: 'Cartão de Crédito',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Parcelamento disponível',
      features: ['Até 12x sem juros*', 'Aprovação rápida', 'Seguro e protegido'],
      processingTime: '1-2 dias úteis',
      color: 'bg-blue-600'
    },
    {
      id: 'BOLETO',
      name: 'Boleto Bancário',
      icon: <FileText className="w-6 h-6" />,
      description: 'Pagamento via boleto',
      features: ['Válido por 3 dias', 'Qualquer banco', 'Sem necessidade de conta'],
      processingTime: '1-3 dias úteis',
      color: 'bg-orange-600'
    }
  ];

  const maxInstallments = value >= 100 ? 12 : (value >= 50 ? 6 : 1);
  const installmentOptions = Array.from({ length: maxInstallments }, (_, i) => i + 1);

  const getInstallmentText = (installmentCount: number) => {
    const installmentValue = value / installmentCount;
    if (installmentCount === 1) {
      return `À vista - R$ ${value.toFixed(2)}`;
    }
    return `${installmentCount}x de R$ ${installmentValue.toFixed(2)}${installmentCount <= 3 ? ' sem juros' : ''}`;
  };

  const handleConfirm = () => {
    onPaymentMethodSelect({
      type: selectedMethod,
      installments: selectedMethod === 'CREDIT_CARD' ? installments : 1
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl bg-military-black border-military-gold/30">
        <CardHeader className="border-b border-military-gold/20">
          <CardTitle className="text-military-gold">Escolha a forma de pagamento</CardTitle>
          <CardDescription className="text-gray-300">
            Pagamento para: <span className="text-white font-medium">{eventName}</span>
          </CardDescription>
          <div className="text-2xl font-bold text-white">
            R$ {value.toFixed(2)}
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <RadioGroup value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as any)}>
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="relative">
                  <Label htmlFor={method.id} className="cursor-pointer">
                    <div className={`border-2 rounded-lg p-4 transition-all ${
                      selectedMethod === method.id 
                        ? 'border-military-gold bg-military-gold/10' 
                        : 'border-gray-600 hover:border-gray-400'
                    }`}>
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className={`${method.color} p-2 rounded-lg text-white`}>
                          {method.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{method.name}</h3>
                            <div className="flex items-center text-sm text-gray-400">
                              <Clock className="w-4 h-4 mr-1" />
                              {method.processingTime}
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm mt-1">{method.description}</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {method.features.map((feature, index) => (
                              <span key={index} className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                        {method.id === 'PIX' && (
                          <div className="flex items-center text-green-400">
                            <Zap className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {selectedMethod === 'CREDIT_CARD' && maxInstallments > 1 && (
            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
              <Label className="text-white font-medium mb-2 block">Parcelamento</Label>
              <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {installmentOptions.map((count) => (
                    <SelectItem key={count} value={count.toString()} className="text-white hover:bg-gray-600">
                      {getInstallmentText(count)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {installments > 3 && (
                <p className="text-yellow-400 text-sm mt-2">
                  * Juros podem ser aplicados pelo banco emissor a partir da 4ª parcela
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-military-gold text-military-black hover:bg-military-gold/80 font-semibold"
            >
              Continuar pagamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentMethodSelector;